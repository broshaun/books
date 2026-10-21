import { createSignal, createEffect, For, Show } from 'solid-js';
import { IconChevronRight, IconLoader2, IconBookmark, IconTrash, IconList } from '@tabler/icons-solidjs';
import type { NavItem } from 'epubjs';

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
      <div class="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-left group transition-colors hover:bg-[var(--bg-hover)]">
        <span
          class="text-sm truncate flex-1 cursor-pointer transition-colors"
          style={{ color: "var(--text-main)" }}
          onClick={() => {
            if (props.item.href) {
              props.onSelectChapter(props.item.href);
              props.onClose();
            }
          }}
        >
          {props.item.label.trim()}
        </span>

        <Show when={hasChildren}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded());
            }}
            class="p-1 cursor-pointer -mr-1 rounded hover:bg-[var(--bg-hover)]"
          >
            <IconChevronRight
              size={14}
              style={{ color: "var(--accent-color)" }}
              class={`transform transition-transform duration-200 ${expanded() ? 'rotate-90' : ''}`}
            />
          </button>
        </Show>
      </div>

      <Show when={hasChildren && expanded()}>
        <div class="pl-3 space-y-0.5 mt-0.5 border-l ml-2" style={{ "border-color": "var(--border-color)" }}>
          <For each={props.item.subitems}>
            {(sub) => <TocItem item={sub} onSelectChapter={props.onSelectChapter} onClose={props.onClose} />}
          </For>
        </div>
      </Show>
    </div>
  );
}

export function EpubTocDrawer(props: EpubTocDrawerProps) {
  const [toc, setToc] = createSignal<NavItem[]>([]);
  const [loading, setLoading] = createSignal(false);
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

  const drawerWidthStyle = () => {
    const s = props.size ?? '380px';
    return typeof s === 'number' ? `${s}px` : s;
  };

  const currentBookmarks = () => props.bookmarks?.() ?? [];

  return (
    <>
      {/* 1. 遮罩层：与 EpubStyleDrawer 风格统一 */}
      <div
        class={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-45 transition-opacity duration-300 ease-in-out ${
          props.opened ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={props.onClose}
      />

      {/* 2. 抽屉主体：采用统一的主题变量背景和右侧弹出动画 */}
      <div
        class={`fixed inset-y-0 right-0 z-50 shadow-2xl border-l flex flex-col pt-12 px-4 pb-4 transform transition-transform duration-300 ease-in-out backdrop-blur-xl bg-[var(--bg-surface)]/95 ${
          props.opened ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: drawerWidthStyle(),
          'max-width': '100vw',
          color: 'var(--text-main)',
          'border-color': 'var(--border-color)',
        }}
      >
        {/* 顶部标题栏与 Tab 切换 */}
        <div class="flex flex-col border-b pb-2 shrink-0" style={{ "border-color": "var(--border-color)" }}>
          <div class="flex items-center justify-between pb-3">
            <span class="font-bold text-base tracking-wide" style={{ color: "var(--text-main)" }}>
              书签与目录
            </span>
            <button
              type="button"
              onClick={props.onClose}
              style={{ color: "var(--text-secondary)" }}
              class="text-xs font-medium cursor-pointer px-2 py-1 rounded-md transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
            >
              关闭
            </button>
          </div>

          {/* Tab 切换栏 */}
          <div class="flex items-center gap-6 mt-1">
            <button
              type="button"
              onClick={() => setActiveTab('toc')}
              style={{
                "border-color": activeTab() === 'toc' ? "var(--accent-color)" : "transparent",
                color: activeTab() === 'toc' ? "var(--text-main)" : "var(--text-secondary)",
              }}
              class="flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-all hover:text-[var(--text-main)]"
            >
              <IconList size={16} />
              目录
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              style={{
                "border-color": activeTab() === 'bookmarks' ? "var(--accent-color)" : "transparent",
                color: activeTab() === 'bookmarks' ? "var(--text-main)" : "var(--text-secondary)",
              }}
              class="flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-all hover:text-[var(--text-main)]"
            >
              <IconBookmark size={16} />
              书签 ({currentBookmarks().length})
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div class="flex-1 overflow-y-auto py-3 space-y-1">
          <Show when={activeTab() === 'toc'}>
            <Show
              when={!loading()}
              fallback={
                <div class="flex justify-center items-center pt-24 gap-2" style={{ color: "var(--text-secondary)" }}>
                  <IconLoader2 size={18} class="animate-spin" />
                  <span class="text-xs">正在加载目录...</span>
                </div>
              }
            >
              <div class="space-y-0.5">
                <For each={toc()} fallback={<div class="text-xs text-center py-12" style={{ color: "var(--text-secondary)" }}>暂无目录</div>}>
                  {(item) => <TocItem item={item} onSelectChapter={props.onSelectChapter} onClose={props.onClose} />}
                </For>
              </div>
            </Show>
          </Show>

          <Show when={activeTab() === 'bookmarks'}>
            <div class="space-y-1">
              <For each={currentBookmarks()} fallback={<div class="text-xs text-center py-12" style={{ color: "var(--text-secondary)" }}>暂无书签，快去添加吧</div>}>
                {(bookmark) => (
                  <div class="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] group transition-colors">
                    <div
                      class="flex-1 min-w-0 cursor-pointer pr-2"
                      onClick={() => {
                        props.onSelectChapter(bookmark.cfi);
                        props.onClose();
                      }}
                    >
                      <p class="text-sm truncate font-medium" style={{ color: "var(--text-main)" }}>
                        {bookmark.title || bookmark.cfi}
                      </p>
                      <span class="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        {new Date(bookmark.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <Show when={props.onRemoveBookmark}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onRemoveBookmark?.(bookmark.cfi);
                        }}
                        style={{ color: "var(--text-secondary)" }}
                        class="p-1.5 rounded-md cursor-pointer transition-colors hover:text-red-500 hover:bg-[var(--bg-main)]"
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
      </div>
    </>
  );
}

export default EpubTocDrawer;