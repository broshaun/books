import { createSignal, For, Show } from 'solid-js';
import { IconQuote, IconX, IconLoader2 } from '@tabler/icons-solidjs';
import Accordion from 'corvu/accordion';

export interface NewNote {
  bookId: string;
  bookName: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  tags?: string[];
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

interface EpubNotesTimelineProps {
  tags: Record<string, number>; // 接收来自 useEpubNotes 的 indexTags
  notes: NewNote[];             // 接收来自 useEpubNotes 的 currentIndexNotes
  isSyncing?: boolean;          // 🌟 新增：外部传入的同步状态
  onSelectNote?: (cfiRange: string) => void;
  onDelete?: (cfiRange: string) => void;
  onSelectTag?: (tag: string | null) => void;
}

const parseCfi = (cfi: string): number[] => {
  const m = cfi.match(/!\/[\d/]+/);
  return m ? m[0].split('/').map(v => parseInt(v, 10) || 0) : [0];
};

const formatTime = (ts?: number) => {
  if (!ts) return '';
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getTagBtnClass = (isSelected: boolean) => 
  `px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
    isSelected ? 'bg-stone-200 text-stone-900 shadow-2xs font-semibold' : 'bg-stone-100/60 hover:bg-stone-200/60 text-stone-600'
  }`;

export function EpubNotesTimeline(props: EpubNotesTimelineProps) {
  const [activeTag, setActiveTag] = createSignal<string>('all');

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    props.onSelectTag?.(tag === 'all' ? null : tag);
  };

  const sortedNotes = () => [...(props.notes || [])].sort((a, b) => {
    const posA = parseCfi(a.cfiRange);
    const posB = parseCfi(b.cfiRange);
    for (let i = 0; i < Math.max(posA.length, posB.length); i++) {
      const diff = (posA[i] || 0) - (posB[i] || 0);
      if (diff !== 0) return diff;
    }
    return a.cfiRange.localeCompare(b.cfiRange);
  });

  return (
    <div class="w-full h-full p-2 bg-transparent overflow-y-auto overflow-x-hidden text-stone-900 flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-400">
      
      {/* 🌟 最上方标题栏：【笔记】及右侧同步图标 */}
      <div class="flex items-center justify-between px-1 pb-2 mb-2 border-b border-stone-200/60 shrink-0">
        <span class="text-xs font-bold text-stone-800 tracking-wider">笔记</span>
        
        {/* 同步状态图标：当 isSyncing 为 true 时旋转，也可以根据需要调整隐藏逻辑 */}
        <Show when={props.isSyncing}>
          <div class="flex items-center gap-1 text-[10px] text-stone-400">
            <IconLoader2 size={14} class="animate-spin text-blue-500" />
            <span>同步中...</span>
          </div>
        </Show>
      </div>

      {/* 顶部标签栏 */}
      <Show when={props.tags && Object.keys(props.tags).length > 0}>
        <div class="flex items-center flex-wrap gap-1.5 pb-2.5 mb-2 border-b border-stone-200/60 shrink-0">
          <button 
            type="button" 
            onClick={() => handleTagClick('all')} 
            class={getTagBtnClass(activeTag() === 'all')}
          >
            全部 ({props.tags['all'] ?? 0})
          </button>

          <For each={Object.entries(props.tags || {}).filter(([tag]) => tag !== 'all')}>
            {([tag, count]) => (
              <button 
                type="button" 
                onClick={() => handleTagClick(tag)} 
                class={getTagBtnClass(activeTag() === tag)}
              >
                <span>{tag}</span>
                <span class="text-[10px] opacity-70">({count})</span>
              </button>
            )}
          </For>
        </div>
      </Show>

      {/* 笔记列表内容区 */}
      <div class="flex-1 min-h-0">
        <Show
          when={sortedNotes().length > 0}
          fallback={
            <div class="h-full flex items-center justify-center p-4 text-center text-xs text-stone-400">
              {activeTag() === 'all' ? '当前章节暂无笔记' : `标签 "${activeTag()}" 下暂无笔记`}
            </div>
          }
        >
          <div class="relative w-full space-y-3">
            <div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-stone-200 rounded-full pointer-events-none" />

            <Accordion collapsible>
              <For each={sortedNotes()}>
                {(note) => (
                  <Accordion.Item value={note.cfiRange}>
                    {(item) => (
                      <div class="relative w-full flex items-start gap-2.5 mb-3 last:mb-0">
                        {/* 时间轴圆点 */}
                        <div class="relative shrink-0 w-4 flex flex-col items-center pt-1.5 z-10">
                          <div class={`w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-200 flex items-center justify-center ${item.expanded ? 'border-stone-800 scale-110 shadow-xs' : 'border-stone-300'}`}>
                            <Show when={item.expanded}>
                              <div class="w-1 h-1 rounded-full bg-stone-800" />
                            </Show>
                          </div>
                        </div>

                        {/* 笔记主体 */}
                        <div class="flex-1 min-w-0 pr-1">
                          <Accordion.Trigger
                            onClick={() => props.onSelectNote?.(note.cfiRange)}
                            class="w-full text-left flex flex-col gap-1 group cursor-pointer focus:outline-none"
                          >
                            <div class="flex items-center justify-between gap-2 w-full">
                              <span class="text-xs font-semibold truncate text-stone-900 tracking-tight">
                                {note.title || '笔记'}
                              </span>
                              <Show when={note.updatedAt}>
                                <span class="text-[10px] text-stone-400 tabular-nums shrink-0">
                                  {formatTime(note.updatedAt)}
                                </span>
                              </Show>
                            </div>

                            <Show when={note.text}>
                              <div class="relative w-full px-2.5 py-2 rounded-lg border border-stone-300/70 bg-stone-50/60 shadow-2xs text-left flex items-start justify-between gap-2">
                                <div class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ background: note.color || '#facc15' }} />
                                
                                <div class="flex items-start gap-1.5 pl-1 flex-1 min-w-0">
                                  <IconQuote size={12} class="mt-0.5 shrink-0 text-stone-400" />
                                  <p class="text-[11px] leading-relaxed whitespace-pre-wrap break-all text-stone-700 font-medium">
                                    {note.text}
                                  </p>
                                </div>

                                <Show when={props.onDelete}>
                                  <button
                                    type="button"
                                    title="删除笔记"
                                    onClick={(e) => { e.stopPropagation(); props.onDelete?.(note.cfiRange); }}
                                    class="p-0.5 text-stone-600 cursor-pointer shrink-0 self-start"
                                  >
                                    <IconX size={12} />
                                  </button>
                                </Show>
                              </div>
                            </Show>
                          </Accordion.Trigger>

                          <Accordion.Content
                            class="overflow-hidden transition-[height] duration-200 ease-out"
                            style={{ height: item.expanded ? 'var(--corvu-accordion-content-height)' : '0px' }}
                          >
                            <div class="pt-1.5 pb-1">
                              <Show when={note.content} fallback={<p class="text-[10px] text-stone-400 italic">暂无补充心得...</p>}>
                                <div class="p-2 rounded-lg bg-stone-100/70 border border-stone-200/60 text-[11px] text-stone-700 leading-relaxed whitespace-pre-wrap break-all">
                                  {note.content}
                                </div>
                              </Show>
                            </div>
                          </Accordion.Content>
                        </div>
                      </div>
                    )}
                  </Accordion.Item>
                )}
              </For>
            </Accordion>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default EpubNotesTimeline;