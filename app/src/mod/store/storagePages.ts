import { createSignal, onMount, onCleanup, createMemo } from "solid-js";
import localforage from "localforage";

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

const pagesStoreMap = new Map<string, CachePagesState<any, any>>();
const pagesListenersMap = new Map<string, Set<() => void>>();

export async function clearStoragePages(): Promise<boolean> {
  pagesStoreMap.clear();
  pagesListenersMap.clear();
  try {
    await localforage.clear();
    return true;
  } catch {
    return false;
  }
}

export function createStoragePages<TData = any, TPageParam = any>({
  cacheKey,
  queryFn,
  staleTime = 0,
  initialPageParam,
}: {
  cacheKey: (string | number)[];
  queryFn: (param: any) => Promise<TData> | TData;
  staleTime?: number;
  initialPageParam: TPageParam;
}) {
  if (!cacheKey?.length || typeof queryFn !== "function") {
    throw new Error("[PagesCache] Invalid options");
  }

  const key = cacheKey.join("::");
  const defaultState: CachePagesState<TData, TPageParam> = {
    data: null,
    error: null,
    hasNextPage: true,
    isInitialLoading: true,
  };

  const getStore = () => pagesStoreMap.get(key) ?? defaultState;

  const updateStore = (patch: Partial<CachePagesState<TData, TPageParam>>) => {
    const next = Object.assign({}, getStore(), patch);
    pagesStoreMap.set(key, next);
    pagesListenersMap.get(key)?.forEach((cb) => cb());
    return next;
  };

  const getRecord = () =>
    localforage.getItem<{ data: InfiniteData<TData, TPageParam>; timestamp: number; hasNextPage: boolean }>(key).catch(() => null);

  const safeNetworkFetch = async (param: any = initialPageParam, append = false) => {
    try {
      const res = await queryFn(param);
      if (res === undefined) return null;

      const storeData = getStore().data;
      const pages = append && storeData?.pages ? [...storeData.pages, res] : [res];
      const pageParams = append && storeData?.pageParams ? [...storeData.pageParams, param] : [param];
      const finalData = { pages, pageParams };

      updateStore({ data: finalData, error: null, isInitialLoading: false });
      localforage.setItem(key, { data: finalData, timestamp: Date.now(), hasNextPage: getStore().hasNextPage }).catch(() => {});
      return finalData;
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
      safeNetworkFetch(initialPageParam).catch(() => {});
    }
  };

  return {
    get: async () => (await getRecord())?.data ?? null,
    fetch,
    refresh: () => safeNetworkFetch(initialPageParam, false),

    usePages: <TSelected = InfiniteData<TData, TPageParam>>(options?: {
      select?: (data: InfiniteData<TData, TPageParam>) => TSelected;
    }) => {
      const [state, setState] = createSignal(getStore());
      const [isFetchingNextPage, setIsFetchingNextPage] = createSignal(false);

      onMount(() => {
        let listeners = pagesListenersMap.get(key);
        if (!listeners) {
          listeners = new Set();
          pagesListenersMap.set(key, listeners);
        }
        const listener = () => setState(getStore());
        listeners.add(listener);

        if (!pagesStoreMap.has(key)) fetch();
        else setState(getStore());

        onCleanup(() => listeners?.delete(listener));
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
          const res = await safeNetworkFetch(nextParam, true);
          const lastPage = res?.pages?.[res.pages.length - 1];
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