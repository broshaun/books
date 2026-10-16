import { createSignal, batch, onCleanup } from "solid-js";

export interface MatchResult<V = any> {
  value: V;
  after?: () => void;
}

interface UseCapturedOptions<K = string, V = any> {
  resolve: (keyMap: Map<K, number>) => V | MatchResult<V> | null | undefined;
  /** 💡 延迟收集的时间窗口 (ms)，默认为 0（即时触发） */
  waitMs?: number;
}

export function useCaptured<K = string, V = any>(options: UseCapturedOptions<K, V>) {
  const { resolve, waitMs = 0 } = options;

  const [current, setCurrent] = createSignal<V | null>(null, { equals: false });
  
  let tempMap = new Map<K, number>();
  let resolveTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (resolveTimer) {
      clearTimeout(resolveTimer);
      resolveTimer = null;
    }
  };

  const evaluate = () => {
    if (!resolve) return;
    const result = resolve(new Map(tempMap));

    if (result !== null && result !== undefined) {
      clearTimer();
      tempMap.clear();

      const value = typeof result === "object" && result !== null && "value" in result 
        ? (result as MatchResult<V>).value 
        : (result as V);

      const afterCallback = typeof result === "object" && result !== null && "after" in result 
        ? (result as MatchResult<V>).after 
        : undefined;

      batch(() => {
        (setCurrent as (v: V) => void)(value);
      });

      if (afterCallback) {
        afterCallback();
      }
    }
  };

  const push = (key: K) => {
    tempMap.set(key, Date.now());
    clearTimer();

    if (waitMs <= 0) {
      // 默认为 0 时，即时触发解析
      evaluate();
    } else {
      // 开启延迟收集窗口：在 window 内有新事件进来时重置计时器，合并收集
      resolveTimer = setTimeout(() => {
        evaluate();
      }, waitMs);
    }
  };

  const clear = () => {
    clearTimer();
    tempMap.clear();
    batch(() => {
      (setCurrent as (v: V | null) => void)(null);
    });
  };

  onCleanup(clear);

  return {
    current,
    push,
    clear,
  };
}