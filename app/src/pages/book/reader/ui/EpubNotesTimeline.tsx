import { For, Show } from 'solid-js';
import { IconQuote, IconX } from '@tabler/icons-solidjs';
import Accordion from '@corvu/accordion';

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

interface EpubNotesTimelineProps {
  notes: NewNote[];
  onSelectNote?: (cfiRange: string) => void;
  onDelete?: (cfiRange: string) => void;
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

export function EpubNotesTimeline(props: EpubNotesTimelineProps) {
  const sortedNotes = () => 
    [...(props.notes || [])].sort((a, b) => {
      const posA = parseCfi(a.cfiRange);
      const posB = parseCfi(b.cfiRange);
      for (let i = 0; i < Math.max(posA.length, posB.length); i++) {
        const diff = (posA[i] || 0) - (posB[i] || 0);
        if (diff !== 0) return diff;
      }
      return a.cfiRange.localeCompare(b.cfiRange);
    });

  return (
    <div class="w-full h-full p-2 bg-transparent overflow-y-auto overflow-x-hidden text-stone-900">
      <Show
        when={sortedNotes().length > 0}
        fallback={
          <div class="h-full flex items-center justify-center p-4 text-center text-xs text-stone-400">
            当前章节暂无笔记
          </div>
        }
      >
        <div class="relative w-full space-y-3">
          {/* 主垂直轨道线 */}
          <div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-stone-200 rounded-full pointer-events-none" />

          <Accordion collapsible>
            <For each={sortedNotes()}>
              {(note) => (
                <Accordion.Item value={note.cfiRange}>
                  {(propsItem) => {
                    const isExpanded = () => propsItem.expanded;

                    return (
                      <div class="relative w-full flex items-start gap-2.5 mb-3 last:mb-0">
                        {/* 左侧轨道节点区 */}
                        <div class="relative shrink-0 w-4 flex flex-col items-center pt-1.5 z-10">
                          <div
                            class={`w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-200 flex items-center justify-center ${
                              isExpanded() ? 'border-stone-800 scale-110 shadow-xs' : 'border-stone-300'
                            }`}
                          >
                            <Show when={isExpanded()}>
                              <div class="w-1 h-1 rounded-full bg-stone-800" />
                            </Show>
                          </div>
                        </div>

                        {/* 右侧卡片主体内容区 */}
                        <div class="flex-1 min-w-0 pr-1">
                          {/* 卡片头部 Trigger */}
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
                              {/* 引用内容卡片 */}
                              <div class="relative w-full px-2.5 py-2 rounded-lg border border-stone-300/70 bg-stone-50/60 shadow-2xs text-left flex items-start justify-between gap-2">
                                <div 
                                  class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                                  style={{ background: note.color || '#facc15' }}
                                />
                                
                                <div class="flex items-start gap-1.5 pl-1 flex-1 min-w-0">
                                  <IconQuote size={12} class="mt-0.5 shrink-0 text-stone-400" />
                                  <p class="text-[11px] leading-relaxed whitespace-pre-wrap break-all text-stone-700 font-medium">
                                    {note.text}
                                  </p>
                                </div>

                                {/* 删除按钮：使用 IconX */}
                                <Show when={props.onDelete}>
                                  <button
                                    type="button"
                                    title="删除笔记"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      props.onDelete?.(note.cfiRange);
                                    }}
                                    class="p-0.5 text-stone-600 cursor-pointer shrink-0 self-end"
                                  >
                                    <IconX size={14} />
                                  </button>
                                </Show>
                              </div>
                            </Show>
                          </Accordion.Trigger>

                          {/* 展开详情区 */}
                          <Accordion.Content
                            class="overflow-hidden transition-[height] duration-200 ease-out"
                            style={{
                              height: isExpanded() ? 'var(--corvu-accordion-content-height)' : '0px',
                            }}
                          >
                            <div class="pt-1.5 pb-1">
                              <Show
                                when={note.content}
                                fallback={<p class="text-[10px] text-stone-400 italic">暂无补充心得...</p>}
                              >
                                <div class="p-2 rounded-lg bg-stone-100/70 border border-stone-200/60 text-[11px] text-stone-700 leading-relaxed whitespace-pre-wrap break-all">
                                  {note.content}
                                </div>
                              </Show>
                            </div>
                          </Accordion.Content>
                        </div>
                      </div>
                    );
                  }}
                </Accordion.Item>
              )}
            </For>
          </Accordion>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesTimeline;