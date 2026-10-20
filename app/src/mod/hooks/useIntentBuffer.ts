import { createSignal, batch, onCleanup } from "solid-js";

export type IntentEntry<P = Record<string, any>> = {
  time: number;
  last?: IntentEntry<P>;
} & P;

type BaseEntry<P> = { time: number } & P;

interface UseIntentBufferOptions<K = string, P = Record<string, any>, V = any> {
  resolve: (keyMap: Map<K, IntentEntry<P>>) => V | null | undefined;
  waitMs?: number;
  /** 记录 last 的最大层数，默认为 1。设为 0 表示不记录 last */
  historyDepth?: number;
}

export function useIntentBuffer<K = string, P = Record<string, any>, V = any>(
  options: UseIntentBufferOptions<K, P, V>
) {
  const { resolve, waitMs = 0, historyDepth = 1 } = options;
  const [current, setCurrent] = createSignal<V | null>(null, { equals: false });

  let keyMap = new Map<K, IntentEntry<P>>();
  let historyMap = new Map<K, Array<BaseEntry<P>>>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const resetAll = () => {
    clearTimer();
    keyMap.clear();
    historyMap.clear();
  };

  const evaluate = () => {
    clearTimer();
    const result = resolve(new Map(keyMap));

    if (result != null) {
      resetAll();
      batch(() => setCurrent(result as any));
    }
  };

  const push = (key: K, payload: P = {} as P) => {
    const nowItem: BaseEntry<P> = { time: Date.now(), ...payload } as any;
    const hist = historyMap.get(key) || [];

    // 组装指定深度的 last 链条，保证最内层绝对纯净
    let lastEntry: IntentEntry<P> | undefined;
    if (historyDepth > 0 && hist.length > 0) {
      const items = hist.slice(0, historyDepth);
      for (let i = items.length - 1; i >= 0; i--) {
        lastEntry = { ...items[i], ...(lastEntry ? { last: lastEntry } : {}) } as any;
      }
    }

    const entry: IntentEntry<P> = {
      ...nowItem,
      ...(lastEntry ? { last: lastEntry } : {}),
    };

    if (historyDepth > 0) {
      historyMap.set(key, [nowItem, ...hist].slice(0, historyDepth));
    }
    keyMap.set(key, entry);

    clearTimer();
    if (waitMs <= 0) {
      evaluate();
    } else {
      timer = setTimeout(evaluate, waitMs);
    }
  };

  const clear = () => {
    resetAll();
    batch(() => setCurrent(null));
  };

  onCleanup(clear);

  return { current, push, clear };
}