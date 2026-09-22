import { type ParentProps, splitProps, type JSX } from 'solid-js';

export interface AppGestureProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  onSwipeRight?: (e: PointerEvent) => void; // 向右滑
  onSwipeLeft?: (e: PointerEvent) => void;  // 向左滑
  threshold?: number;                       // 触发阈值，默认 40px
}

export function AppGesture(props: AppGestureProps) {
  const [local, rest] = splitProps(props, [
    'children', 
    'height', 
    'class', 
    'onSwipeRight', 
    'onSwipeLeft',
    'threshold'
  ]);

  let startX = 0;
  const threshold = local.threshold ?? 40;

  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: PointerEvent) => {
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) < threshold) return;

    if (deltaX > 0) {
      local.onSwipeRight?.(e);
    } else {
      local.onSwipeLeft?.(e);
    }
  };

  return (
    <div
      style={{ height: typeof local.height === 'number' ? `${local.height}px` : local.height }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      class={`touch-pan-y select-none ${local.class ?? ''}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export default AppGesture;