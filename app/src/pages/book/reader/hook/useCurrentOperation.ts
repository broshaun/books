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
  let active = false;

  const opt = (value: T) => {
    if (!active) {
      active = true;
      setCurrentSet(new Set<T>([value]));
    } else {
      setCurrentSet((prev) => {
        const next = new Set<T>(prev);
        next.add(value);
        return next;
      });
    }

    if (timerRef) {
      clearTimeout(timerRef);
    }

    timerRef = setTimeout(() => {
      active = false;
      timerRef = null;
    }, interval);
  };

  const clear = () => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = null;
    }

    active = false;
    setCurrentSet(new Set<T>());
  };

  const reset = (values: T[] = []) => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = null;
    }

    active = false;
    setCurrentSet(new Set<T>(values));
  };

  onCleanup(() => {
    if (timerRef) {
      clearTimeout(timerRef);
    }
  });

  return {
    currentSet,
    opt,
    clear,
    reset,
  };
}