import { createSignal, createEffect, For, Show } from 'solid-js';
import { IconSearch, IconX, IconLoader2 } from '@tabler/icons-solidjs';

export interface SearchResult {
  cfi: string;
  excerpt: string;
}

export interface EpubSearchDrawerProps {
  opened: boolean;
  onClose: () => void;
  book: any;
  onSelectResult: (cfi: string, keyword: string) => void;
  size?: string | number;
}

export function EpubSearchDrawer(props: EpubSearchDrawerProps) {
  const [results, setSearchResults] = createSignal<SearchResult[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [lastSearched, setLastSearched] = createSignal('');
  let searchToken = 0;

  // 清除状态
  const handleClear = () => {
    searchToken++;
    setQuery('');
    setLastSearched('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleClose = () => {
    handleClear();
    props.onClose();
  };

  // 执行 EPUB 全文搜索
  const executeSearch = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed || !props.book) {
      handleClear();
      return;
    }

    const currentToken = ++searchToken;
    setIsSearching(true);
    setLastSearched(trimmed);

    try {
      await props.book.ready;
      const spineItems = props.book.spine?.spineItems || props.book.spine?.items || [];
      const matchesList: SearchResult[] = [];

      for (const item of spineItems) {
        if (currentToken !== searchToken) return;

        try {
          await item.load(props.book.load.bind(props.book));
          const matches = item.find(trimmed);

          if (matches?.length) {
            const fullText = (item.document?.body?.innerText || '').replace(/\s+/g, ' ');

            matches.forEach((m: any) => {
              let excerpt = m.excerpt || m.text || '';

              // 补充富上下文片段（前后各 40 字符）
              if (excerpt.length < 30 && fullText) {
                const idx = fullText.toLowerCase().indexOf(trimmed.toLowerCase());
                if (idx !== -1) {
                  const start = Math.max(0, idx - 40);
                  const end = Math.min(fullText.length, idx + trimmed.length + 40);
                  excerpt = `...${fullText.substring(start, end)}...`;
                }
              }

              matchesList.push({
                cfi: m.cfi,
                excerpt: excerpt || `匹配关键词 "${trimmed}"`,
              });
            });
          }
          item.unload();
        } catch {
          /* 忽略单个章节解析失败 */
        }
      }

      if (currentToken === searchToken) {
        setSearchResults(matchesList);
      }
    } catch (err) {
      console.error('EPUB Search Error:', err);
    } finally {
      if (currentToken === searchToken) {
        setIsSearching(false);
      }
    }
  };

  const drawerHeightStyle = () => {
    const s = props.size ?? '90%';
    return typeof s === 'number' ? `${s}px` : s;
  };

  // 辅助函数：高亮关键词片段
  const renderHighlightedExcerpt = (text: string, highlight: string) => {
    if (!highlight) return text;
    try {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span class="bg-yellow-200/80 dark:bg-yellow-800/80 text-stone-900 dark:text-stone-100 font-semibold px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <>
      {/* 1. 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-45 transition-opacity duration-300 ease-in-out ${
          props.opened
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* 2. 底部弹出抽屉主体：采用无死板背景色 + 多层阴影 + 顶部细腻边框 */}
      <div
        class={`fixed inset-x-0 bottom-0 z-50 w-full shadow-2xl shadow-stone-900/20 border-t border-stone-200/80 dark:border-zinc-800/80 rounded-t-2xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out backdrop-blur-xl bg-inherit/95 ${
          props.opened ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: drawerHeightStyle(), 'max-height': '90vh' }}
      >
        {/* 顶部标题栏 */}
        <div class="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-zinc-800/60 shrink-0">
          <span class="font-semibold text-base text-stone-800 dark:text-stone-100">
            搜索书中内容
          </span>
          <button
            type="button"
            onClick={handleClose}
            class="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer px-2 py-1 rounded-md transition-colors"
          >
            关闭
          </button>
        </div>

        {/* 内容区域 */}
        <div class="flex-1 flex flex-col pt-3 overflow-hidden gap-3">
          {/* 输入框区 */}
          <div class="relative flex items-center">
            <span class="absolute left-3 text-stone-400">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="输入关键词，按 Enter 搜索..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeSearch(query());
                }
              }}
              class="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-stone-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/40 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <Show when={query()}>
              <button
                type="button"
                onClick={handleClear}
                class="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </Show>
          </div>

          {/* 搜索结果列表区 */}
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <Show
              when={!isSearching()}
              fallback={
                <div class="flex justify-center items-center pt-24 gap-2 text-stone-400">
                  <IconLoader2 size={18} class="animate-spin" />
                  <span class="text-xs">正在检索全书内容...</span>
                </div>
              }
            >
              <Show
                when={!(lastSearched() && results().length === 0)}
                fallback={
                  <div class="text-xs text-stone-400 text-center py-20">
                    未找到包含“{lastSearched()}”的内容
                  </div>
                }
              >
                <For each={results()}>
                  {(item) => (
                    <div
                      onClick={() => {
                        props.onSelectResult(item.cfi, lastSearched());
                        handleClose();
                      }}
                      class="p-3 rounded-lg border border-stone-200/60 dark:border-zinc-800/60 text-xs leading-relaxed text-stone-700 dark:text-stone-300 line-clamp-2 cursor-pointer transition-colors"
                    >
                      {renderHighlightedExcerpt(item.excerpt, lastSearched())}
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}

export default EpubSearchDrawer;