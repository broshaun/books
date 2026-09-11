import Dexie, { type Table } from "dexie";


export interface CacheStoreState<TKey extends string | number = string, TData = any> {
    dataMap: Record<TKey, TData>;
    indexKeys: TKey[];
    error: Error | null;
    isInitialLoading: boolean;
}

export interface CacheRecord<TKey extends string | number = string, TData = any> {
    id: TKey;
    data: TData;
    timestamp: number;
    ttl: number;
}

export interface CreateStorageCacheOptions<TData = any, TKey extends string | number = string> {
    cacheKey: (string | number)[];
    primaryKey?: (item: TData) => TKey;
    queryFn: () => Promise<TData | TData[]> | TData | TData[];
    staleTime?: number;
}

class StorageCacheDatabase extends Dexie {
    constructor() {
        super("StorageCacheDatabase");
    }
}

export const cacheDb = new StorageCacheDatabase();

const storeMap = new Map<string, CacheStoreState<any, any>>();
const listenersMap = new Map<string, Set<() => void>>();
const inflightMap = new Map<string, Promise<any>>();

function getCacheTable(tableName: string): Table<CacheRecord<any, any>, any> {
    if (!cacheDb.tables.some((t) => t.name === tableName)) {
        cacheDb.version(cacheDb.verno + 1).stores({
            [tableName]: "id",
        });
    }
    return cacheDb.table(tableName);
}

export async function clearStorageCache(): Promise<boolean> {
    inflightMap.clear();
    storeMap.clear();
    listenersMap.forEach((s) => s.forEach((cb) => cb()));
    listenersMap.clear();
    try {
        const tableNames = cacheDb.tables.map((t) => t.name);
        await Promise.all(tableNames.map((name) => cacheDb.table(name).clear()));
        return true;
    } catch {
        return false;
    }
}

export function createStorageCache<
    TData = any,
    TKey extends string | number = undefined extends ReturnType<
        NonNullable<CreateStorageCacheOptions<TData>["primaryKey"]>
    >
    ? number
    : string
>({
    cacheKey,
    primaryKey,
    queryFn,
    staleTime = 0,
}: CreateStorageCacheOptions<TData, TKey>) {
    if (!cacheKey?.length || typeof queryFn !== "function") {
        throw new Error("[Cache] Invalid options");
    }

    const tableName = cacheKey.join("::");
    const table = getCacheTable(tableName);

    const getStore = (): CacheStoreState<TKey, TData> =>
        (storeMap.get(tableName) as CacheStoreState<TKey, TData>) ?? {
            dataMap: {} as Record<TKey, TData>,
            indexKeys: [],
            error: null,
            isInitialLoading: true,
        };

    const updateStore = (patch: Partial<CacheStoreState<TKey, TData>>) => {
        const next = { ...getStore(), ...patch };
        storeMap.set(tableName, next);
        listenersMap.get(tableName)?.forEach((cb) => cb());
        return next;
    };

    const getRecords = async (): Promise<CacheRecord<TKey, TData>[]> => {
        try {
            return await table.toArray();
        } catch {
            return [];
        }
    };

    const saveToStorage = (items: TData[]) => {
        const now = Date.now();
        const records: CacheRecord<TKey, TData>[] = items.map((item, index) => {
            const pk = (primaryKey ? primaryKey(item) : index) as TKey;
            return {
                id: pk,
                data: item,
                timestamp: now,
                ttl: staleTime,
            };
        });
        table.bulkPut(records).catch(() => { });
    };

    const safeNetworkFetch = async () => {
        const fetchKey = `${tableName}::fetch`;
        if (inflightMap.has(fetchKey)) return inflightMap.get(fetchKey);

        const promise = (async () => {
            try {
                const res = await queryFn();
                if (res === undefined) return res;

                const items = Array.isArray(res) ? res : [res];
                const dataMap = {} as Record<TKey, TData>;
                const indexKeys: TKey[] = [];

                items.forEach((item, index) => {
                    const pk = (primaryKey ? primaryKey(item) : index) as TKey;
                    dataMap[pk] = item;
                    indexKeys.push(pk);
                });

                updateStore({ dataMap, indexKeys, error: null, isInitialLoading: false });
                saveToStorage(items);
                return dataMap;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                updateStore({ error, isInitialLoading: false });
                throw error;
            }
        })();

        inflightMap.set(fetchKey, promise);
        return promise.finally(() => inflightMap.delete(fetchKey));
    };

    const fetch = async () => {
        const records = await getRecords();
        if (records.length > 0) {
            const dataMap = {} as Record<TKey, TData>;
            const indexKeys: TKey[] = [];
            let oldestTimestamp = Date.now();

            records.forEach((record) => {
                const pk = record.id;
                dataMap[pk] = record.data;
                indexKeys.push(pk);
                if (record.timestamp < oldestTimestamp) {
                    oldestTimestamp = record.timestamp;
                }
            });

            updateStore({
                dataMap,
                indexKeys,
                error: null,
                isInitialLoading: false,
            });

            const recordTtl = records[0]?.ttl ?? staleTime;
            if (Date.now() > oldestTimestamp + recordTtl) {
                safeNetworkFetch().catch(() => { });
            }
            return;
        }
        await safeNetworkFetch().catch(() => { });
    };

    const set = (updater: Record<TKey, TData> | TData[] | ((prev: Record<TKey, TData>) => Record<TKey, TData> | TData[])) => {
        const currentStore = getStore();
        const rawNewData = typeof updater === "function" ? updater(currentStore.dataMap) : updater;

        let items: TData[] = [];
        let dataMap = {} as Record<TKey, TData>;
        let indexKeys: TKey[] = [];

        if (Array.isArray(rawNewData)) {
            items = rawNewData;
            items.forEach((item, index) => {
                const pk = (primaryKey ? primaryKey(item) : index) as TKey;
                dataMap[pk] = item;
                indexKeys.push(pk);
            });
        } else {
            dataMap = rawNewData;
            items = Object.values(rawNewData);
            indexKeys = Object.keys(rawNewData) as TKey[];
        }

        updateStore({ dataMap, indexKeys, isInitialLoading: false });
        saveToStorage(items);
    };

    return {
        get: async () => {
            const records = await getRecords();
            if (!records.length) return null;
            const dataMap = {} as Record<TKey, TData>;
            records.forEach((r) => {
                dataMap[r.id] = r.data;
            });
            return dataMap;
        },
        fetch,
        refresh: safeNetworkFetch,
        set,
    };
}

