import { createSignal, batch, onCleanup } from "solid-js";

export interface IntentResult<V = any> {
  value: V;
  after?: () => void;
}

interface UseIntentBufferOptions<K = string, V = any> {
  /** 解析回调：返回业务值或带后置副作用的对象 */
  resolve: (keyMap: Map<K, number>) => V | IntentResult<V> | null | undefined;
  /** 延迟收集时间窗口 (ms)，默认为 0（即时触发） */
  waitMs?: number;
}

/** 使用示例
  const { current, push } = useIntentBuffer({
    waitMs: 200, // 开启 200ms 缓冲窗口，完美聚合同步触发的触控事件
    resolve: (document) => {
      console.log("document实时内容:", document);
      // 单独包含 "Mark"
      if (document.has("Mark")) {
        return "EDIT_NOTE";
      }
      // 快速点击
      if (document.has("PointerDown") && document.has("PointerUp")) {
        const downTime = document.get("PointerDown")!;
        const upTime = document.get("PointerUp")!;
        const duration = upTime - downTime;
        if (duration < 300) {
          return "TIMELINE";
        }
      }
      // 同时包含 "Select" 和 "PointerUp"
      if (document.has("Select")) {
        if (document.has("PointerUp")) {
          return "CREATE_NOTE";
        }
        return
      }
    }
  });
 */
export function useIntentBuffer<K = string, V = any>(options: UseIntentBufferOptions<K, V>) {
  const { resolve, waitMs = 0 } = options;

  const [current, setCurrent] = createSignal<V | null>(null, { equals: false });

  let keyMap = new Map<K, number>();
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

      const value = typeof result === "object" && result !== null && "value" in result
        ? (result as IntentResult<V>).value
        : (result as V);

      const after = typeof result === "object" && result !== null && "after" in result
        ? (result as IntentResult<V>).after
        : undefined;

      batch(() => {
        (setCurrent as (v: V) => void)(value);
      });

      after?.();
    }
  };

  const push = (key: K) => {
    keyMap.set(key, Date.now());
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