import { createSignal, createEffect, For, Show } from 'solid-js';
import { IconChevronRight, IconLoader2 } from '@tabler/icons-solidjs';
import Drawer from '@corvu/drawer';
import type { NavItem } from 'epubjs';

export interface EpubTocDrawerProps {
  opened: boolean;
  onClose: () => void;
  book: any;
  onSelectChapter: (href: string) => void;
  size?: string | number;
}

// 递归渲染目录项组件
function TocItem(props: {
  item: NavItem;
  onSelectChapter: (href: string) => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = createSignal(false);
  const hasChildren = Boolean(props.item.subitems?.length);

  return (
    <div class="flex flex-col">
      <div class="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-left group">
        {/* 章节名称 */}
        <span
          class="text-sm truncate flex-1 text-stone-700 dark:text-stone-200 cursor-pointer"
          onClick={() => {
            if (props.item.href) {
              props.onSelectChapter(props.item.href);
              props.onClose();
            }
          }}
        >
          {props.item.label.trim()}
        </span>

        {/* 若有子目录，渲染展开/收起按钮 */}
        <Show when={hasChildren}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded());
            }}
            class="p-1 cursor-pointer -mr-1" // 移除悬浮背景色，微调边距
          >
            {/* [修改点] 这里明确指定了图标的颜色，确保在任何背景下都可见 */}
            <IconChevronRight
              size={14}
              class={`transform transition-transform duration-200 text-blue-600 dark:text-blue-400 ${
                expanded() ? 'rotate-90' : ''
              }`}
            />
          </button>
        </Show>
      </div>

      {/* 子目录区域 */}
      <Show when={hasChildren && expanded()}>
        <div class="pl-3 space-y-0.5 mt-0.5 border-l border-stone-200/60 dark:border-zinc-700/60 ml-2">
          <For each={props.item.subitems}>
            {(sub) => (
              <TocItem
                item={sub}
                onSelectChapter={props.onSelectChapter}
                onClose={props.onClose}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

export function EpubTocDrawer(props: EpubTocDrawerProps) {
  const [toc, setToc] = createSignal<NavItem[]>([]);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    const bookInstance = props.book;
    if (!bookInstance) return;

    let isMounted = true;
    setLoading(true);

    bookInstance.loaded.navigation
      .then((nav: any) => {
        if (isMounted) setToc(nav.toc || []);
      })
      .catch((err: any) => console.error('加载目录失败:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  });

  // 计算抽屉宽度
  const drawerWidthStyle = () => {
    const s = props.size ?? '380px';
    return typeof s === 'number' ? `${s}px` : s;
  };

  return (
    <Drawer
      open={props.opened}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      side="right"
    >
      <Drawer.Portal>
        {/* 1. 遮罩层 */}
        <Drawer.Overlay class="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300" />

        {/* 2. 抽屉主体 */}
        <Drawer.Content
          class="fixed inset-y-0 right-0 z-50 h-full shadow-2xl shadow-stone-900/20 border-l border-stone-200/80 dark:border-zinc-800/80 flex flex-col focus:outline-none backdrop-blur-xl bg-inherit/95"
          style={{ width: drawerWidthStyle(), 'max-width': '100vw' }}
        >
          {/* 顶部标题栏 */}
          <div class="flex items-center justify-between px-4 py-3.5 border-b border-stone-200/60 dark:border-zinc-800/60 shrink-0 bg-white/30 dark:bg-zinc-900/30">
            <span class="font-semibold text-base text-stone-800 dark:text-stone-100">
              目录
            </span>
            <button
              type="button"
              onClick={props.onClose}
              class="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer px-2 py-1 rounded-md transition-colors"
            >
              关闭
            </button>
          </div>

          {/* 内容区域 */}
          <div class="flex-1 overflow-y-auto p-3">
            <Show
              when={!loading()}
              fallback={
                <div class="flex justify-center items-center pt-24 gap-2 text-stone-400">
                  <IconLoader2 size={18} class="animate-spin" />
                  <span class="text-xs">正在加载目录...</span>
                </div>
              }
            >
              <div class="space-y-0.5">
                <For
                  each={toc()}
                  fallback={
                    <div class="text-xs text-stone-400 text-center py-12">
                      暂无目录
                    </div>
                  }
                >
                  {(item) => (
                    <TocItem
                      item={item}
                      onSelectChapter={props.onSelectChapter}
                      onClose={props.onClose}
                    />
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
}

export default EpubTocDrawer;