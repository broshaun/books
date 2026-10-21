import { createSignal, children, Show, onMount, onCleanup, type JSX } from 'solid-js';
import { IconPlus } from '@tabler/icons-solidjs';

export interface QuickActionMenuProps {
  children?: JSX.Element;
  position?: { bottom?: number; right?: number };
  show?: boolean;
}

export function QuickActionMenu(props: QuickActionMenuProps) {
  const [opened, setOpened] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  let containerRef!: HTMLDivElement;
  let menuPanelRef!: HTMLDivElement;

  let bottom = props.position?.bottom ?? 40;
  let right = props.position?.right ?? 24;

  let hasMoved = false;
  let startX = 0, startY = 0, startBottom = 0, startRight = 0;

  const handleOutsideClick = (e: PointerEvent) => {
    if (opened() && containerRef && !containerRef.contains(e.target as Node)) {
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
    startBottom = bottom;
    startRight = right;
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasMoved = true;
        setIsDragging(true);
        setOpened(false);
      }

      if (hasMoved) {
        bottom = Math.max(0, Math.min(startBottom - dy, window.innerHeight - 44));
        right = Math.max(0, Math.min(startRight - dx, window.innerWidth - 44));

        containerRef.style.bottom = `${bottom}px`;
        containerRef.style.right = `${right}px`;

        if (menuPanelRef) {
          const isLeft = right > window.innerWidth / 2;
          menuPanelRef.className = getPanelClass(isLeft, opened());
        }
      }
    };

    const onUp = (ev: PointerEvent) => {
      setIsDragging(false);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId); } catch {}
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // 💡 利用你的 CSS 主题变量动态构建面板样式（自动适配默认、Dark、Sepia、Eye-green、Gray）
  const getPanelClass = (isLeft: boolean, isOpen: boolean) => {
    const dir = isLeft ? 'left-full ml-3.5 origin-left' : 'right-full mr-3.5 origin-right';
    const state = isOpen
      ? 'opacity-100 scale-100 pointer-events-auto'
      : 'opacity-0 scale-90 pointer-events-none';
    return `absolute flex items-center gap-1.5 p-2 rounded-2xl backdrop-blur-2xl transition-all duration-200 ${dir} ${state}`;
  };

  const resolvedChildren = children(() => props.children);

  return (
    <Show when={props.show ?? true}>
      <Show when={isDragging()}>
        <div class="fixed inset-0 z-35 bg-transparent touch-none select-none" />
      </Show>

      <div
        ref={containerRef}
        class="fixed z-30 flex items-center select-none touch-none"
        style={{ bottom: `${bottom}px`, right: `${right}px` }}
      >
        {/* 💡 绑定 CSS 变量：背景、边框、文字、阴影完全由当前主题控制 */}
        <div
          ref={menuPanelRef}
          class={getPanelClass(right > window.innerWidth / 2, opened())}
          style={{
            "background-color": "var(--bg-surface)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            "box-shadow": "var(--shadow-lg)",
            opacity: opened() ? "1" : "0",
            transform: opened() ? "scale(1)" : "scale(0.9)",
            "pointer-events": opened() ? "auto" : "none",
          }}
          onClick={() => setOpened(false)}
        >
          {resolvedChildren()}
        </div>

        {/* 💡 主悬浮按钮：完美契合当前主题的 3D 立体质感与变量颜色 */}
        <button
          type="button"
          aria-label="功能菜单"
          onPointerDown={handlePointerDown}
          onClick={() => !hasMoved && setOpened((o) => !o)}
          class="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-2xl active:scale-92 active:translate-y-0.5 transition-all duration-200 cursor-pointer select-none"
          style={{
            "background-color": "var(--bg-surface)",
            color: "var(--text-title)",
            border: "1px solid var(--border-color)",
            "box-shadow": "var(--shadow-lg), inset 0 1px 1px rgba(255,255,255,0.4)",
            transform: opened() ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <IconPlus size={22} stroke="2.5" />
        </button>
      </div>
    </Show>
  );
}

export default QuickActionMenu;