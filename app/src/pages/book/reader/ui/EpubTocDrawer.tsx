import { createSignal, createEffect, For, Show } from 'solid-js';
import { IconChevronRight, IconLoader2, IconBookmark, IconTrash, IconList } from '@tabler/icons-solidjs';
import Drawer from '@corvu/drawer';
import type { NavItem } from 'epubjs';

// 定义书签数据结构
export interface BookmarkItem {
  cfi: string;
  title?: string;
  createdAt: number;
}

export interface EpubTocDrawerProps {
  opened: boolean;
  onClose: () => void;
  book: any;
  onSelectChapter: (href: string) => void;
  size?: string | number;
  bookmarks?: () => BookmarkItem[];
  onRemoveBookmark?: (cfi: string) => void;
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
          class="text-sm truncate flex-1 text-stone-700 dark:text-stone-200 cursor-pointer hover:text-blue-600 transition-colors"
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
            class="p-1 cursor-pointer -mr-1"
          >
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
  
  // 标签页状态 ('toc' | 'bookmarks')
  const [activeTab, setActiveTab] = createSignal<'toc' | 'bookmarks'>('toc');

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

  // 获取当前书签数组
  const currentBookmarks = () => props.bookmarks?.() ?? [];

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
          class="fixed inset-y-0 right-0 z-50 h-full shadow-2xl shadow-stone-900/20 border-l border-stone-200/80 dark:border-zinc-800/80 flex flex-col focus:outline-none backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95"
          style={{ width: drawerWidthStyle(), 'max-width': '100vw' }}
        >
          {/* 🌟 顶部固定保留 50px 空白占位 */}
          <div style={{ height: '50px' }} class="shrink-0" />

          {/* 顶部标题栏与 Tab 切换（去除突兀的纯色背景，采用更温和的通透设计） */}
          <div class="flex flex-col border-b border-stone-200/40 dark:border-zinc-800/40 shrink-0 px-4 pt-2 pb-1">
            <div class="flex items-center justify-between py-2">
              <span class="font-medium text-sm text-stone-500 dark:text-stone-400 tracking-wide uppercase">
                书签与目录
              </span>
              <button
                type="button"
                onClick={props.onClose}
                class="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer px-2 py-1 rounded-md transition-colors"
              >
                关闭
              </button>
            </div>

            {/* Tab 切换按钮：采用胶囊/现代下划线混合风格，减少视觉突兀感 */}
            <div class="flex items-center gap-6 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('toc')}
                class={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                  activeTab() === 'toc'
                    ? 'border-blue-600 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                <IconList size={16} />
                目录
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                class={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                  activeTab() === 'bookmarks'
                    ? 'border-blue-600 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                <IconBookmark size={16} />
                书签 ({currentBookmarks().length})
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div class="flex-1 overflow-y-auto p-3">
            <Show when={activeTab() === 'toc'}>
              {/* 目录视图 */}
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
            </Show>

            <Show when={activeTab() === 'bookmarks'}>
              {/* 书签列表视图 */}
              <div class="space-y-1">
                <For
                  each={currentBookmarks()}
                  fallback={
                    <div class="text-xs text-stone-400 text-center py-12">
                      暂无书签，快去添加吧
                    </div>
                  }
                >
                  {(bookmark) => (
                    <div class="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800/60 group transition-colors">
                      {/* 点击书签跳转到对应 CFI */}
                      <div
                        class="flex-1 min-w-0 cursor-pointer pr-2"
                        onClick={() => {
                          props.onSelectChapter(bookmark.cfi);
                          props.onClose();
                        }}
                      >
                        <p class="text-sm truncate text-stone-700 dark:text-stone-200 font-medium">
                          {bookmark.title || bookmark.cfi}
                        </p>
                        <span class="text-[10px] text-stone-400">
                          {new Date(bookmark.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* 删除书签按钮 */}
                      <Show when={props.onRemoveBookmark}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            props.onRemoveBookmark?.(bookmark.cfi);
                          }}
                          class="p-1.5 text-stone-400 hover:text-red-500 rounded-md cursor-pointer transition-colors"
                          title="删除书签"
                        >
                          <IconTrash size={14} />
                        </button>
                      </Show>
                    </div>
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