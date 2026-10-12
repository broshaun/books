
import {
  createSignal,
  children,
  Show,
  onMount,
  onCleanup,
  type JSX,
} from "solid-js";

import {
  IconPlus,
  IconX,
} from "@tabler/icons-solidjs";

export interface QuickActionMenuProps {
  children?: JSX.Element;
  position?: {
    bottom?: number;
    right?: number;
  };

  onOpen?: () => void;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
}

export function QuickActionMenu(props: QuickActionMenuProps) {
  const [opened, setOpened] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  const [pos, setPos] = createSignal({
    bottom: props.position?.bottom ?? 30,
    right: props.position?.right ?? 30,
  });

  let menuRef!: HTMLDivElement;

  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let startBottom = 0;
  let startRight = 0;

  let activePointerId: number | undefined;
  let activeButton: HTMLElement | undefined;

  const resolvedChildren = children(() => props.children);

  const openMenu = () => {
    if (opened()) return;
    setOpened(true);
    props.onOpen?.();
  };

  const closeMenu = () => {
    if (!opened()) return;
    setOpened(false);
    props.onClose?.();
  };

  const toggleMenu = () => {
    if (opened()) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // 拖拽事件清理
  const removeDragListeners = () => {
    window.removeEventListener(
      "pointermove",
      handlePointerMove
    );

    window.removeEventListener(
      "pointerup",
      handlePointerUp
    );

    window.removeEventListener(
      "pointercancel",
      handlePointerCancel
    );
  };

  const finishDrag = () => {
    if (
      activeButton &&
      activePointerId !== undefined
    ) {
      try {
        activeButton.releasePointerCapture(
          activePointerId
        );
      } catch {
        // 指针捕获可能已自动释放
      }
    }

    activePointerId = undefined;
    activeButton = undefined;

    setIsDragging(false);
    removeDragListeners();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (
      !hasMoved &&
      (Math.abs(dx) > 5 || Math.abs(dy) > 5)
    ) {
      hasMoved = true;
      setIsDragging(true);
      closeMenu();
    }

    if (!hasMoved) return;

    const maxBottom = Math.max(
      10,
      window.innerHeight - 60
    );

    const maxRight = Math.max(
      10,
      window.innerWidth - 60
    );

    setPos({
      bottom: Math.max(
        10,
        Math.min(startBottom - dy, maxBottom)
      ),
      right: Math.max(
        10,
        Math.min(startRight - dx, maxRight)
      ),
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;
    finishDrag();
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;
    finishDrag();
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) {
      return;
    }

    hasMoved = false;

    startX = e.clientX;
    startY = e.clientY;
    startBottom = pos().bottom;
    startRight = pos().right;

    activePointerId = e.pointerId;
    activeButton = e.currentTarget as HTMLElement;

    try {
      activeButton.setPointerCapture(e.pointerId);
    } catch {
      // 部分环境不支持指针捕获
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );

    window.addEventListener(
      "pointercancel",
      handlePointerCancel
    );
  };

  // 点击菜单外部时关闭
  const handleOutsidePointerDown = (
    e: PointerEvent
  ) => {
    if (!opened()) return;

    if (props.closeOnOutsideClick === false) {
      return;
    }

    const target = e.target as Node | null;

    if (target && menuRef.contains(target)) {
      return;
    }

    closeMenu();
  };

  // iframe 获取焦点时关闭
  // 适用于 epub.js 在 iframe 内渲染正文的情况
  const handleWindowBlur = () => {
    if (!opened()) return;

    if (props.closeOnOutsideClick === false) {
      return;
    }

    // 等待浏览器更新 activeElement
    requestAnimationFrame(() => {
      if (!opened()) return;

      const active = document.activeElement;

      if (
        active instanceof HTMLIFrameElement &&
        !menuRef.contains(active)
      ) {
        closeMenu();
      }
    });
  };

  onMount(() => {
    document.addEventListener(
      "pointerdown",
      handleOutsidePointerDown,
      true
    );

    window.addEventListener(
      "blur",
      handleWindowBlur
    );

    onCleanup(() => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown,
        true
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur
      );

      removeDragListeners();
    });
  });

  return (
    <>
      {/* 拖拽遮罩 */}
      <Show when={isDragging()}>
        <div
          class="fixed inset-0 z-[9999] cursor-grabbing bg-transparent touch-none"
        />
      </Show>

      <div
        ref={menuRef}
        class="fixed z-[100] flex flex-col items-center select-none touch-none"
        style={{
          bottom: `${pos().bottom}px`,
          right: `${pos().right}px`,
        }}
      >
        {/* 展开的菜单 */}
        <div
          class={`absolute bottom-full mb-3 flex flex-col items-center gap-1.5 rounded-3xl border border-white/40 bg-white/80 p-1.5 shadow-2xl backdrop-blur-md transition-all duration-200 origin-bottom dark:border-zinc-700/50 dark:bg-zinc-950/85 ${
            opened()
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }`}
          onClick={() => closeMenu()}
        >
          {resolvedChildren()}
        </div>

        {/* 主按钮 */}
        <button
          type="button"
          aria-label={opened() ? "关闭功能菜单" : "打开功能菜单"}
          aria-expanded={opened()}
          onPointerDown={handlePointerDown}
          onClick={() => {
            if (hasMoved) {
              hasMoved = false;
              return;
            }

            toggleMenu();
          }}
          class="flex h-11 w-11 cursor-grab items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xl transition-transform duration-200 active:cursor-grabbing"
          style={{
            transform: opened()
              ? "rotate(90deg)"
              : "rotate(0deg)",
          }}
        >
          <Show
            when={opened()}
            fallback={<IconPlus size={22} />}
          >
            <IconX size={22} />
          </Show>
        </button>
      </div>
    </>
  );
}

export default QuickActionMenu;
