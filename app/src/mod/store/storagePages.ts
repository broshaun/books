import { createSignal, onMount, onCleanup, createMemo } from "solid-js";
import localforage from "localforage";

// 创建专属的无限分页缓存实例
const apiCacheStore = localforage.createInstance({ name: "cache", storeName: "pages" });

export interface InfiniteData<T = any, P = any> {
  pages: T[];
  pageParams: P[];
}

export interface CachePagesState<T = any, P = any> {
  data: InfiniteData<T, P> | null;
  error: Error | null;
  hasNextPage: boolean;
  isInitialLoading: boolean;
}

const storeMap = new Map<string, CachePagesState>();
const listenersMap = new Map<string, Set<() => void>>();

export async function clearStoragePages() {
  storeMap.clear();
  listenersMap.clear();
  await apiCacheStore.clear().catch(console.error);
  return true;
}

export function createStoragePages<TData = any, TPageParam = any>({
  cacheKey,
  queryFn,
  staleTime = 0,
  initialPageParam,
}: {
  cacheKey: (string | number)[];
  queryFn: (param: TPageParam) => Promise<TData> | TData;
  staleTime?: number;
  initialPageParam: TPageParam;
}) {
  const key = cacheKey.join("::");
  const defaultState: CachePagesState<TData, TPageParam> = {
    data: null,
    error: null,
    hasNextPage: true,
    isInitialLoading: true,
  };

  const getStore = () => storeMap.get(key) ?? defaultState;

  const updateStore = (patch: Partial<CachePagesState<TData, TPageParam>>) => {
    const next = { ...getStore(), ...patch };
    storeMap.set(key, next);
    listenersMap.get(key)?.forEach((cb) => cb());
    return next;
  };

  const getRecord = () =>
    apiCacheStore.getItem<{ data: InfiniteData<TData, TPageParam>; timestamp: number; hasNextPage: boolean }>(key);

  const fetchNetwork = async (param: TPageParam = initialPageParam, append = false) => {
    try {
      const res = await queryFn(param);
      const storeData = getStore().data;
      const pages = append && storeData?.pages ? [...storeData.pages, res] : [res];
      const pageParams = append && storeData?.pageParams ? [...storeData.pageParams, param] : [param];
      const data = { pages, pageParams };

      updateStore({ data, error: null, isInitialLoading: false });
      await apiCacheStore.setItem(key, { data, timestamp: Date.now(), hasNextPage: getStore().hasNextPage });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      updateStore({ error, isInitialLoading: false });
      throw error;
    }
  };

  const fetch = async () => {
    const record = await getRecord();
    if (record?.data) {
      updateStore({ data: record.data, error: null, hasNextPage: record.hasNextPage ?? true, isInitialLoading: false });
    }
    if (!record || Date.now() > record.timestamp + staleTime) {
      fetchNetwork(initialPageParam).catch(() => {});
    }
  };

  return {
    get: async () => (await getRecord())?.data ?? null,
    fetch,
    refresh: () => fetchNetwork(initialPageParam, false),

    usePages: <TSelected = InfiniteData<TData, TPageParam>>(options?: {
      select?: (data: InfiniteData<TData, TPageParam>) => TSelected;
    }) => {
      const [state, setState] = createSignal(getStore());
      const [isFetchingNextPage, setIsFetchingNextPage] = createSignal(false);

      onMount(() => {
        if (!listenersMap.has(key)) listenersMap.set(key, new Set());
        const listener = () => setState(getStore());
        listenersMap.get(key)!.add(listener);

        if (!storeMap.has(key)) fetch();
        else setState(getStore());

        onCleanup(() => listenersMap.get(key)?.delete(listener));
      });

      const data = createMemo(() => {
        const d = state().data;
        return d && options?.select ? options.select(d) : (d as unknown as TSelected);
      });

      const fetchNextPage = async (
        getNextPageParam: (info: { lastPage: TData; allPages: TData[]; lastPageParam: TPageParam }) => any
      ) => {
        const current = getStore();
        if (!current.hasNextPage || isFetchingNextPage()) return null;

        const { pages = [], pageParams = [initialPageParam] } = current.data || {};
        const nextParam = getNextPageParam({
          lastPage: pages[pages.length - 1],
          allPages: pages,
          lastPageParam: pageParams[pageParams.length - 1],
        });

        if (nextParam == null) {
          updateStore({ hasNextPage: false });
          return null;
        }

        setIsFetchingNextPage(true);
        try {
          const res = await fetchNetwork(nextParam, true);
          const lastPage = res?.pages[res.pages.length - 1];
          if (Array.isArray(lastPage) && lastPage.length === 0) {
            updateStore({ hasNextPage: false });
          }
          return res;
        } catch {
          return null;
        } finally {
          setIsFetchingNextPage(false);
        }
      };

      return {
        get data() { return data(); },
        get loading() { return state().isInitialLoading; },
        get error() { return state().error; },
        get hasNextPage() { return state().hasNextPage; },
        get isFetchingNextPage() { return isFetchingNextPage(); },
        fetchNextPage,
      };
    },
  };
}