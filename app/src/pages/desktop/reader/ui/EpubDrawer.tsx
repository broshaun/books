import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  onMount,
  onCleanup,
} from 'solid-js';
import Drawer from 'corvu/drawer';
import { IconPin, IconPinned } from '@tabler/icons-solidjs';

export interface EpubDrawerProps {
  open?: boolean;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  pinned?: boolean;
  initialPinned?: boolean;
  onPinChange?: (pinned: boolean) => void;
  bg?: string;
  children: JSX.Element;
}

export const EpubDrawer: Component<EpubDrawerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'initialOpen',
    'onOpenChange',
    'pinned',
    'initialPinned',
    'onPinChange',
    'bg',
    'children',
  ]);

  // 支持内部状态（开箱即用）
  const [internalPinned, setInternalPinned] = createSignal(local.initialPinned ?? false);
  const isPinned = () => local.pinned ?? internalPinned();

  const togglePin = () => {
    const next = !isPinned();
    if (local.pinned === undefined) setInternalPinned(next);
    local.onPinChange?.(next);
  };

  const [isLandscape, setIsLandscape] = createSignal(
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  );

  onMount(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const side = () => (isLandscape() ? 'right' : 'top');
  const isTop = () => side() === 'top';

  return (
    <Drawer
      {...others}
      open={local.open}
      initialOpen={local.initialOpen}
      onOpenChange={local.onOpenChange}
      side={side()}
      // 🌟 核心：固定时禁止点击外部关闭
      closeOnOutsidePointer={!isPinned()}
    >
      <Drawer.Portal>
        {/* 🌟 核心：固定时隐藏遮罩或让遮罩不拦截点击 */}
        <Drawer.Overlay
          class={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-open:opacity-100 data-closed:opacity-0 ${
            isPinned() ? 'pointer-events-none opacity-0' : ''
          }`}
        />

        <Drawer.Content
          data-corvu-no-drag
          style={{
            [isTop() ? 'height' : 'width']: isLandscape() ? '35%' : '75%',
            ...(local.bg && !local.bg.startsWith('bg-') ? { background: local.bg } : {}),
          }}
          class={`fixed z-50 flex flex-col shadow-2xl outline-none overscroll-none transition-transform duration-300 ease-out ${
            local.bg?.startsWith('bg-') ? local.bg : 'bg-white'
          } ${
            isTop()
              ? 'inset-x-0 top-0 max-h-[90vh] rounded-b-2xl data-closed:-translate-y-full data-open:translate-y-0'
              : 'inset-y-0 right-0 h-full max-w-[90vw] data-closed:translate-x-full data-open:translate-x-0'
          }`}
        >
          {/* 顶部操作栏（仅保留固定的图钉按钮） */}
          <div
            data-corvu-no-drag
            class="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3"
          >
            <span class="text-xs font-medium text-stone-400">
              {isLandscape() ? '📖 右侧面板 (35%)' : '📖 顶部面板 (75%)'}
            </span>

            <button
              type="button"
              onClick={togglePin}
              class={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                isPinned()
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
              }`}
              title={isPinned() ? '取消固定' : '固定面板'}
            >
              {isPinned() ? (
                <IconPinned size={15} class="text-amber-600" />
              ) : (
                <IconPin size={15} />
              )}
            </button>
          </div>

          {/* 内容区域 */}
          <div
            data-corvu-no-drag
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
          >
            {local.children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};

export default EpubDrawer;