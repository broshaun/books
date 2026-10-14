import { createSignal, onCleanup } from "solid-js";

interface UseCaptureOptions {
  interval?: number;
}

export function useCaptured<T>(
  initialValue: T[] = [],
  options: UseCaptureOptions = {},
) {
  const { interval = 100 } = options;

  const [capturedSet, setCapturedSet] = createSignal<Set<T>>(
    new Set(initialValue),
  );

  let timerRef: ReturnType<typeof setTimeout> | null = null;
  let isWindowActive = false;

  const clearTimer = () => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = null;
    }
  };

  const capture = (value: T) => {
    setCapturedSet((prev) => {
      const next = isWindowActive ? new Set(prev) : new Set<T>();
      next.add(value);
      return next;
    });

    isWindowActive = true;
    clearTimer();

    timerRef = setTimeout(() => {
      isWindowActive = false;
      timerRef = null;
    }, interval);
  };

  const clear = () => {
    clearTimer();
    isWindowActive = false;
    setCapturedSet(new Set<T>());
  };

  onCleanup(clearTimer);

  return {
    capturedSet,
    capture,
    clear,
  };
}