import { createSignal, children, Show, onMount, onCleanup, type JSX } from 'solid-js';
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
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}

    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startBottom = pos().bottom;
    startRight = pos().right;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        hasMoved = true;
        setIsDragging(true);
        setOpened(false);
      }

      if (hasMoved) {
        setPos({
          bottom: Math.max(10, Math.min(startBottom - dy, window.innerHeight - 60)),
          right: Math.max(10, Math.min(startRight - dx, window.innerWidth - 60)),
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

  const resolvedChildren = children(() => props.children);

  return (
    <>
      <Show when={isDragging()}>
        <div class="fixed inset-0 z-35 cursor-grabbing bg-transparent touch-none" />
      </Show>

      <div
        ref={menuRef}
        class="fixed z-30 flex flex-col items-center select-none touch-none"
        style={{ bottom: `${pos().bottom}px`, right: `${pos().right}px` }}
      >
        <div
          class={`absolute bottom-full mb-3 flex flex-col items-center gap-1.5 p-1.5 rounded-3xl bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl transition-all duration-200 origin-bottom ${
            opened()
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
          onClick={() => setOpened(false)}
        >
          {resolvedChildren()}
        </div>

        <button
          type="button"
          aria-label="功能菜单"
          onPointerDown={handlePointerDown}
          onClick={() => !hasMoved && setOpened((o) => !o)}
          class="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xl cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: opened() ? 'rotate(90deg)' : 'rotate(0deg)' }}
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