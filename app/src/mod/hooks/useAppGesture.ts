import { onMount, onCleanup } from "solid-js";

type GestureHandler = (e: PointerEvent) => void;

const handlers = {
  onLeftSwipeRight: new Set<GestureHandler>(),
  onRightSwipeLeft: new Set<GestureHandler>(),
  onTopSwipeBottom: new Set<GestureHandler>(),
  onBottomSwipeTop: new Set<GestureHandler>(),
};

export const triggerLeftSwipeRight = (e: PointerEvent) => handlers.onLeftSwipeRight.forEach(fn => fn(e));
export const triggerRightSwipeLeft = (e: PointerEvent) => handlers.onRightSwipeLeft.forEach(fn => fn(e));
export const triggerTopSwipeBottom = (e: PointerEvent) => handlers.onTopSwipeBottom.forEach(fn => fn(e));
export const triggerBottomSwipeTop = (e: PointerEvent) => handlers.onBottomSwipeTop.forEach(fn => fn(e));

export type UseAppGestureOptions = Partial<Record<keyof typeof handlers, GestureHandler>>;

export function useAppGesture(options: UseAppGestureOptions) {
  onMount(() => {
    Object.entries(options).forEach(([key, fn]) => {
      if (fn && handlers[key as keyof typeof handlers]) {
        handlers[key as keyof typeof handlers].add(fn);
      }
    });
  });

  onCleanup(() => {
    Object.entries(options).forEach(([key, fn]) => {
      if (fn && handlers[key as keyof typeof handlers]) {
        handlers[key as keyof typeof handlers].delete(fn);
      }
    });
  });
}