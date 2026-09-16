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
      <div class="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left group">
        {/* 章节名称点击：触发跳转并关闭抽屉 */}
        <span
          class="text-sm truncate flex-1 text-slate-700 dark:text-slate-200 cursor-pointer"
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
            class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <IconChevronRight
              size={14}
              class={`transform transition-transform duration-200 ${
                expanded() ? 'rotate-90' : ''
              }`}
            />
          </button>
        </Show>
      </div>

      {/* 子目录递归渲染 */}
      <Show when={hasChildren && expanded()}>
        <div class="pl-3 space-y-0.5 mt-0.5 border-l border-slate-200 dark:border-zinc-800 ml-2">
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
        {/* 1. 遮罩层：使用 Drawer.Overlay */}
        <Drawer.Overlay class="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" />

        {/* 2. 抽屉主体 (右侧滑出) */}
        <Drawer.Content
          class="fixed inset-y-0 right-0 z-50 h-full bg-white dark:bg-zinc-900 shadow-xl flex flex-col focus:outline-none"
          style={{ width: drawerWidthStyle(), 'max-width': '100vw' }}
        >
          {/* 顶部标题栏 */}
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 shrink-0">
            <span class="font-semibold text-base text-slate-800 dark:text-slate-100">
              目录
            </span>
            <button
              type="button"
              onClick={props.onClose}
              class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              关闭
            </button>
          </div>

          {/* 内容区域 (带滚动条) */}
          <div class="flex-1 overflow-y-auto p-3">
            <Show
              when={!loading()}
              fallback={
                <div class="flex justify-center items-center pt-24 gap-2 text-slate-400">
                  <IconLoader2 size={18} class="animate-spin" />
                  <span class="text-xs">正在加载目录...</span>
                </div>
              }
            >
              <div class="space-y-0.5">
                <For
                  each={toc()}
                  fallback={
                    <div class="text-xs text-slate-400 text-center py-12">
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