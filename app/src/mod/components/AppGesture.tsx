import { type ParentProps, splitProps, type JSX } from 'solid-js';
import { 
  triggerLeftSwipeRight, 
  triggerRightSwipeLeft, 
  triggerTopSwipeBottom, 
  triggerBottomSwipeTop 
} from '@/hooks/useAppGesture';

export interface AppGestureProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
}

export function AppGesture(props: AppGestureProps) {
  const [local, rest] = splitProps(props, ['children', 'height', 'class']);

  let startX = 0;
  let startY = 0;
  let containerWidth = 0;
  let tracking = false;

  const handlePointerDown = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    containerWidth = target.clientWidth;
    startX = e.clientX;
    startY = e.clientY;
    tracking = true;
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!tracking) return;
    tracking = false;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absY > absX && absY > 30) {
      (deltaY > 0 ? triggerTopSwipeBottom : triggerBottomSwipeTop)(e);
    } else if (absX > absY && absX > 30) {
      if (startX < containerWidth / 2 && deltaX > 0) {
        triggerLeftSwipeRight(e);
      } else if (startX >= containerWidth / 2 && deltaX < 0) {
        triggerRightSwipeLeft(e);
      }
    }
  };

  return (
    <div
      style={{ height: typeof local.height === 'number' ? `${local.height}px` : local.height }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (tracking = false)}
      class={`touch-none select-none ${local.class ?? ''}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export default AppGesture;