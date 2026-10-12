import { createSignal, children, Show, type JSX } from 'solid-js';
import { IconPlus, IconX } from '@tabler/icons-solidjs';

export interface QuickActionMenuProps {
  children?: JSX.Element;
  position?: { bottom?: number; right?: number };
}

export function QuickActionMenu(props: QuickActionMenuProps) {
  const [opened, setOpened] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);
  const [pos, setPos] = createSignal({
    bottom: props.position?.bottom ?? 30,
    right: props.position?.right ?? 30,
  });

  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let startBottom = 0;
  let startRight = 0;

  const handlePointerDown = (e: PointerEvent) => {
    // 兼容鼠标左键或手机触控
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // 锁定指针，防止手机滑动过快丢失焦点
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}

    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startBottom = pos().bottom;
    startRight = pos().right;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // 移动超过 5 像素判定为拖拽
      if (!hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        hasMoved = true;
        setIsDragging(true);
        setOpened(false); // 拖拽时自动收起菜单
      }

      if (hasMoved) {
        // 核心修复：bottom/right 定位下，向上推(dy < 0)应该增加 bottom；向左拉(dx < 0)应该增加 right
        const newBottom = startBottom - dy;
        const newRight = startRight - dx;

        // 限制在视口范围内，防止被拖出屏幕外
        const maxBottom = window.innerHeight - 60;
        const maxRight = window.innerWidth - 60;

        setPos({
          bottom: Math.max(10, Math.min(newBottom, maxBottom)),
          right: Math.max(10, Math.min(newRight, maxRight)),
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(upEvent.pointerId);
      } catch (err) {}

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const resolvedChildren = children(() => props.children);

  return (
    <>
      {/* 拖拽时全屏覆盖的透明遮罩层：拦截 iframe 干扰，保证手机滑动丝滑 */}
      <Show when={isDragging()}>
        <div class="fixed inset-0 z-[9999] cursor-grabbing bg-transparent touch-none" />
      </Show>

      <div
        class="fixed z-[100] flex flex-col items-center select-none touch-none"
        style={{
          bottom: `${pos().bottom}px`,
          right: `${pos().right}px`,
        }}
      >
        {/* 弹出的菜单项容器 */}
        <div
          class={`absolute bottom-full mb-3 flex flex-col items-center gap-1.5 p-1.5 rounded-3xl bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 shadow-2xl transition-all duration-200 origin-bottom ${
            opened()
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
          onClick={() => setOpened(false)}
        >
          {resolvedChildren()}
        </div>

        {/* 主控制按钮 */}
        <button
          type="button"
          aria-label="功能菜单"
          onPointerDown={handlePointerDown}
          onClick={() => !hasMoved && setOpened((o) => !o)}
          class="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xl cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{
            transform: opened() ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <Show when={opened()} fallback={<IconPlus size={22} />}>
            <IconX size={22} />
          </Show>
        </button>
      </div>
    </>
  );
}

export default QuickActionMenu;