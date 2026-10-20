import { createSignal, batch, onCleanup } from "solid-js";

/** 
 * 意图条目结构：包含时间戳，并支持通过联合类型将 payload 的属性扁平展开到根节点
 * P 为额外信息的对象类型
 */
export type IntentEntry<P = Record<string, any>> = {
  time: number;
} & P;

interface UseIntentBufferOptions<K = string, P = Record<string, any>, V = any> {
  /** 解析回调：接收包含 time 和扁平化扩展属性的 Map */
  resolve: (keyMap: Map<K, IntentEntry<P>>) => V | null | undefined;
  /** 延迟收集时间窗口 (ms)，默认为 0（即时触发） */
  waitMs?: number;
}

export function useIntentBuffer<K = string, P = Record<string, any>, V = any>(
  options: UseIntentBufferOptions<K, P, V>
) {
  const { resolve, waitMs = 0 } = options;

  const [current, setCurrent] = createSignal<V | null>(null, { equals: false });

  // 内部 Map 存储 key 对应的扁平化 IntentEntry
  let keyMap = new Map<K, IntentEntry<P>>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const evaluate = () => {
    clearTimer();
    const result = resolve(new Map(keyMap));

    if (result !== null && result !== undefined) {
      keyMap.clear();
      batch(() => {
        (setCurrent as (v: V) => void)(result);
      });
    }
  };

  /** 
   * push 支持传入第二个参数 payload（对象）
   * 默认给空对象 {}，并通过 ...payload 扁平展开到对象根节点
   */
  const push = (key: K, payload: P = {} as P) => {
    keyMap.set(key, {
      time: Date.now(),
      ...payload,
    });
    clearTimer();

    if (waitMs <= 0) {
      evaluate();
    } else {
      timer = setTimeout(evaluate, waitMs);
    }
  };

  const clear = () => {
    clearTimer();
    keyMap.clear();
    batch(() => {
      (setCurrent as (v: V | null) => void)(null);
    });
  };

  onCleanup(clear);

  return { current, push, clear };
}