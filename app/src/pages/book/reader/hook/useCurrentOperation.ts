import { createSignal, onCleanup } from "solid-js";

interface UseCurrentOperationOptions {
  interval?: number;
}

export function useCurrentOperation<T>(
  initialValue: T[] = [],
  options: UseCurrentOperationOptions = {},
) {
  const { interval = 100 } = options;

  const [currentSet, setCurrentSet] = createSignal<Set<T>>(
    new Set(initialValue),
  );

  let timerRef: ReturnType<typeof setTimeout> | null = null;
  let isWindowActive = false;

  // 抽离统一的定时器清理逻辑
  const clearTimer = () => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = null;
    }
  };

  const opt = (value: T) => {
    if (!isWindowActive) {
      isWindowActive = true;
      setCurrentSet(new Set<T>([value]));
    } else {
      setCurrentSet((prev) => {
        const next = new Set<T>(prev);
        next.add(value);
        return next;
      });
    }

    clearTimer();

    timerRef = setTimeout(() => {
      isWindowActive = false;
      timerRef = null;
    }, interval);
  };

  const clear = () => {
    clearTimer();
    isWindowActive = false;
    setCurrentSet(new Set<T>());
  };

  const reset = (values: T[] = []) => {
    clearTimer();
    isWindowActive = false;
    setCurrentSet(new Set<T>(values));
  };

  onCleanup(() => {
    clearTimer();
  });

  return {
    currentSet,
    opt,
    clear,
    reset,
  };
}