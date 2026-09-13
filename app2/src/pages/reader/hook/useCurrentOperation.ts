import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCurrentOperationOptions {
  /**
   * 多长时间内的 opt 调用视为同一批操作
   * 默认 100ms
   */
  interval?: number;
}

export function useCurrentOperation<T>(
  initialValue: T[] = [],
  options: UseCurrentOperationOptions = {},
) {
  const { interval = 100 } = options;

  const [currentSet, setCurrentSet] = useState<Set<T>>(
    () => new Set(initialValue),
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 当前是否处于同一批操作窗口
   */
  const activeRef = useRef(false);

  const opt = useCallback(
    (value: T) => {
      /**
       * 新一轮操作
       *
       * 覆盖上一轮 Set
       */
      if (!activeRef.current) {
        activeRef.current = true;

        setCurrentSet(new Set([value]));
      } else {
        /**
         * 同一轮操作
         *
         * 合并进当前 Set
         */
        setCurrentSet((prev) => {
          const next = new Set(prev);

          next.add(value);

          return next;
        });
      }

      /**
       * 每次 opt 都重新计算时间窗口
       *
       * 因此连续：
       *
       * opt('A')
       * 50ms
       * opt('B')
       * 50ms
       * opt('C')
       *
       * 最终会得到：
       *
       * A + B + C
       */
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        activeRef.current = false;
        timerRef.current = null;
      }, interval);
    },
    [interval],
  );

  /**
   * 手动清空
   */
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    activeRef.current = false;

    setCurrentSet(new Set());
  }, []);

  /**
   * 手动覆盖
   */
  const reset = useCallback((values: T[] = []) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    activeRef.current = false;

    setCurrentSet(new Set(values));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    currentSet,
    opt,
    clear,
    reset,
  };
}