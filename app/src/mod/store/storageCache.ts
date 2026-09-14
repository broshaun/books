import { createSignal, onMount, onCleanup } from "solid-js";
import localforage from "localforage";

export interface CacheStoreState<TData> {
  data: TData | null;
  error: Error | null;
  isInitialLoading: boolean;
}

export interface StorageCacheOptions<TData, TKey extends string | number> {
  cacheKey: (string | number)[];
  queryFn: () => Promise<TData> | TData;
  staleTime?: number;
  primaryKey?: (item: any) => TKey;
}

const storeMap = new Map<string, CacheStoreState<any>>();
const listenersMap = new Map<string, Set<() => void>>();
const inflightMap = new Map<string, Promise<any>>();

export async function clearStorageCache(): Promise<boolean> {
  inflightMap.clear();
  storeMap.clear();
  listenersMap.forEach((s) => s.forEach((cb) => cb()));
  listenersMap.clear();
  try {
    await localforage.clear();
    return true;
  } catch {
    return false;
  }
}

export function createStorageCache<TData = any, TKey extends string | number = string>({
  cacheKey,
  queryFn,
  staleTime = 0,
  primaryKey,
}: StorageCacheOptions<TData, TKey>) {
  if (!cacheKey?.length || typeof queryFn !== "function") {
    throw new Error("[Cache] Invalid options");
  }

  const key = cacheKey.join("::");

  const getStore = (): CacheStoreState<TData> =>
    storeMap.get(key) ?? { data: null, error: null, isInitialLoading: true };

  const updateStore = (patch: Partial<CacheStoreState<TData>>) => {
    const next = Object.assign(getStore(), patch);
    storeMap.set(key, next);
    listenersMap.get(key)?.forEach((cb) => cb());
    return next;
  };

  const getRecord = () => localforage.getItem<{ data: TData; timestamp: number }>(key).catch(() => null);
  const saveToStorage = (data: TData) => localforage.setItem(key, { data, timestamp: Date.now() }).catch(() => {});

  const processData = (rawData: any): TData => {
    if (!primaryKey) return rawData;
    if (Array.isArray(rawData)) {
      const map = new Map<TKey, any>();
      rawData.forEach((item, i) => map.set(primaryKey(item) ?? i, item));
      return Array.from(map.values()) as unknown as TData;
    }
    if (rawData && typeof rawData === "object") {
      const result: Record<string | number, any> = {};
      Object.values(rawData).forEach((item, i) => {
        result[primaryKey(item) ?? i] = item;
      });
      return result as unknown as TData;
    }
    return rawData;
  };

  const safeNetworkFetch = async () => {
    const fetchKey = `${key}::fetch`;
    if (inflightMap.has(fetchKey)) return inflightMap.get(fetchKey);

    const promise = (async () => {
      try {
        const res = await queryFn();
        if (res === undefined) return res;
        const data = processData(res);
        updateStore({ data, error: null, isInitialLoading: false });
        saveToStorage(data);
        return data;
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
    const record = await getRecord();
    if (record?.data !== undefined) {
      updateStore({ data: record.data, error: null, isInitialLoading: false });
    }
    if (!record || Date.now() > record.timestamp + staleTime) {
      safeNetworkFetch().catch(() => {});
    }
  };

  const set = (updater: TData | ((prev: TData | null) => TData)) => {
    const current = getStore().data;
    const data = processData(typeof updater === "function" ? (updater as any)(current) : updater);
    updateStore({ data, isInitialLoading: false });
    saveToStorage(data);
  };

  return {
    get: async () => (await getRecord())?.data ?? null,
    fetch,
    refresh: safeNetworkFetch,
    set,

    useQuery: <TSelected = TData>(
      selectorOrOptions?:
        | ((data: TData) => TSelected)
        | { select?: (data: TData) => TSelected; pk?: TKey }
    ) => {
      const [state, setState] = createSignal<CacheStoreState<TData>>(getStore());

      onMount(() => {
        let setListeners = listenersMap.get(key);
        if (!setListeners) listenersMap.set(key, (setListeners = new Set()));
        
        const listener = () => setState(getStore());
        setListeners.add(listener);

        if (!storeMap.has(key)) fetch();
        else setState(getStore());

        onCleanup(() => setListeners?.delete(listener));
      });

      const isOptObj = typeof selectorOrOptions === "object";
      const select = isOptObj ? selectorOrOptions?.select : selectorOrOptions;
      const pk = isOptObj ? selectorOrOptions?.pk : undefined;

      const data = () => {
        const d = state().data;
        if (d == null) return null;
        const target = pk !== undefined ? (d as any)?.[pk] ?? null : d;
        if (target == null && pk !== undefined) return null;
        return select ? select(target) : (target as unknown as TSelected);
      };

      const loading = () => {
        const s = state();
        return pk !== undefined 
          ? s.isInitialLoading && (s.data as any)?.[pk] === undefined 
          : s.isInitialLoading && s.data == null;
      };

      return {
        get data() { return data(); },
        get loading() { return loading(); },
        get error() { return state().error; },
        refetch: safeNetworkFetch,
        set,
      };
    },
  };
}