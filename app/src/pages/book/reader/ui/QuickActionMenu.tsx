import { createSignal, children, For, Show, type JSX } from 'solid-js';
import { IconPlus, IconX } from '@tabler/icons-solidjs';

export interface QuickActionMenuProps {
  children?: JSX.Element;
  position?: { bottom?: number; right?: number; top?: number; left?: number };
}

export function QuickActionMenu(props: QuickActionMenuProps) {
  const [opened, setOpened] = createSignal(false);
  const [pos, setPos] = createSignal({
    bottom: props.position?.bottom ?? 20,
    right: props.position?.right ?? 35,
  });

  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let startBottom = 0;
  let startRight = 0;

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

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
      }

      if (hasMoved) {
        setPos({
          bottom: startBottom - dy,
          right: startRight - dx,
        });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 处理子节点，自动为每个子元素注入点击后自动关闭菜单的逻辑
  const resolvedChildren = children(() => props.children);
  const enhancedChildren = () => {
    const list = resolvedChildren();
    const items = Array.isArray(list) ? list : [list];

    return items.map((child) => {
      if (typeof child === 'object' && child !== null && 't' in child) {
        // 如果是 Solid 虚拟节点，可以通过克隆或传递包装函数处理，
        // 建议调用子元素时由外部控制，或在这里通过事件委托处理。
      }
      return child;
    });
  };

  return (
    <div
      class="fixed z-[100] flex flex-col items-center select-none"
      style={{
        bottom: `${pos().bottom}px`,
        right: `${pos().right}px`,
      }}
    >
      {/* 弹出的菜单项容器（带过渡动画） */}
      <div
        class={`absolute bottom-full mb-3 flex flex-col items-center gap-1.5 p-1.5 rounded-3xl bg-white/65 dark:bg-zinc-900/75 backdrop-blur-[12px] saturate-160 border border-white/50 dark:border-zinc-700/50 shadow-2xl transition-all duration-200 origin-bottom ${
          opened()
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        onClick={() => setOpened(false)}
      >
        {/* 渲染并拦截子节点的点击事件实现自动关闭 */}
        {(() => {
          const raw = resolvedChildren();
          const items = Array.isArray(raw) ? raw : [raw];
          return (
            <For each={items}>
              {(item) => (
                <div
                  onClick={(e) => {
                    // 尝试触发子元素原有的 onClick（如果具备的话）
                    if (typeof item === 'object' && item !== null && 'props' in item) {
                      (item as any).props?.onClick?.(e);
                    }
                    setOpened(false);
                  }}
                >
                  {item}
                </div>
              )}
            </For>
          );
        })()}
      </div>

      {/* 主控制按钮 */}
      <button
        type="button"
        aria-label="功能菜单"
        onPointerDown={handlePointerDown}
        onClick={() => !hasMoved && setOpened((o) => !o)}
        class="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-200"
        style={{
          transform: opened() ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        <Show when={opened()} fallback={<IconPlus size={20} />}>
          <IconX size={20} />
        </Show>
      </button>
    </div>
  );
}

export default QuickActionMenu;