import { createSignal, children, Show, onMount, onCleanup, type JSX } from 'solid-js';
import { IconPlus, IconX } from '@tabler/icons-solidjs';

export interface QuickActionMenuProps {
  children?: JSX.Element;
  position?: { bottom?: number; right?: number };
  /** 👈 新增：菜单展开方向 (top: 向上, bottom: 向下, left: 向左, right: 向右) */
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

export function QuickActionMenu(props: QuickActionMenuProps) {
  const [opened, setOpened] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);
  const [pos, setPos] = createSignal({
    bottom: props.position?.bottom ?? 40,
    right: props.position?.right ?? 24,
  });

  let menuRef: HTMLDivElement | undefined;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let startBottom = 0;
  let startRight = 0;

  const handleOutsideClick = (e: PointerEvent) => {
    if (opened() && menuRef && !menuRef.contains(e.target as Node)) {
      setOpened(false);
    }
  };

  onMount(() => window.addEventListener('pointerdown', handleOutsideClick));
  onCleanup(() => window.removeEventListener('pointerdown', handleOutsideClick));

  const handlePointerDown = (e: PointerEvent) => {
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}

    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startBottom = pos().bottom;
    startRight = pos().right;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasMoved = true;
        setIsDragging(true);
        setOpened(false);
      }

      if (hasMoved) {
        setPos({
          bottom: Math.max(16, Math.min(startBottom - dy, window.innerHeight - 80)),
          right: Math.max(16, Math.min(startRight - dx, window.innerWidth - 80)),
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(upEvent.pointerId); } catch {}
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 根据 direction 计算弹出菜单的绝对定位偏移与动画原点
  const getDirectionStyles = () => {
    const dir = props.direction || 'top';
    switch (dir) {
      case 'bottom':
        return {
          container: 'absolute top-full mt-3 flex-col',
          origin: 'origin-top',
        };
      case 'left':
        return {
          container: 'absolute right-full mr-3 flex-row',
          origin: 'origin-right',
        };
      case 'right':
        return {
          container: 'absolute left-full ml-3 flex-row',
          origin: 'origin-left',
        };
      case 'top':
      default:
        return {
          container: 'absolute bottom-full mb-3 flex-col',
          origin: 'origin-bottom',
        };
    }
  };

  const resolvedChildren = children(() => props.children);

  return (
    <>
      <Show when={isDragging()}>
        <div class="fixed inset-0 z-35 bg-transparent touch-none" />
      </Show>

      <div
        ref={menuRef}
        class="fixed z-30 flex flex-col items-center select-none touch-none"
        style={{ bottom: `${pos().bottom}px`, right: `${pos().right}px` }}
      >
        {/* 弹出菜单项：根据 direction 动态调整位置和展开方向 */}
        <div
          class={`absolute flex items-center gap-2 p-2 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xl transition-all duration-200 ${
            getDirectionStyles().container
          } ${getDirectionStyles().origin} ${
            opened()
              ? 'opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-x-0 translate-y-0 pointer-events-none'
          }`}
          onClick={() => setOpened(false)}
        >
          {resolvedChildren()}
        </div>

        {/* 移动端主控制按钮 */}
        <button
          type="button"
          aria-label="功能菜单"
          onPointerDown={handlePointerDown}
          onClick={() => !hasMoved && setOpened((o) => !o)}
          class="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg active:scale-95 transition-transform duration-200 cursor-pointer"
          style={{ transform: opened() ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <Show when={opened()} fallback={<IconPlus size={24} />}>
            <IconX size={24} />
          </Show>
        </button>
      </div>
    </>
  );
}

export default QuickActionMenu;