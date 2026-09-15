import { createSignal, createMemo, For, Show } from 'solid-js';
import { IconQuote } from '@tabler/icons-solidjs';

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
}

const extractCfiPosition = (cfi: string): number[] => {
  const matches = cfi.match(/!\/[\d/]+/);
  return matches ? matches[0].split('/').map(v => parseInt(v, 10) || 0) : [0];
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export function EpubNotesTimeline(props: EpubNotesTimelineProps) {
  const [activeIndex, setActiveIndex] = createSignal(0);

  const sortedNotes = createMemo(() => 
    [...(props.notes || [])].sort((a, b) => {
      const posA = extractCfiPosition(a.cfiRange);
      const posB = extractCfiPosition(b.cfiRange);
      for (let i = 0; i < Math.max(posA.length, posB.length); i++) {
        const diff = (posA[i] || 0) - (posB[i] || 0);
        if (diff !== 0) return diff;
      }
      return a.cfiRange.localeCompare(b.cfiRange);
    })
  );

  return (
    <div class="p-2 sm:p-4 overflow-y-auto h-full [word-break:break-all]">
      <Show
        when={sortedNotes().length > 0}
        fallback={
          <div class="p-6 text-center">
            <span class="text-xs text-slate-400">当前章节暂无笔记</span>
          </div>
        }
      >
        {/* 自定义时间轴容器 */}
        <div class="relative pl-6 space-y-4">
          {/* 左侧垂直时间轴主线条 */}
          <div class="absolute left-[9px] top-2 bottom-2 w-[3px] bg-slate-200 dark:bg-zinc-800 rounded-full" />

          <For each={sortedNotes()}>
            {(note, index) => {
              const isActive = () => activeIndex() === index();
              return (
                <div
                  onClick={() => {
                    setActiveIndex(index());
                    props.onSelectNote?.(note.cfiRange);
                  }}
                  class="relative group cursor-pointer"
                >
                  {/* 时间轴节点圆点 (Bullet) */}
                  <div
                    class={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center bg-white dark:bg-zinc-900 ${
                      isActive()
                        ? 'border-blue-500 scale-110 shadow-xs'
                        : 'border-slate-300 dark:border-zinc-700 group-hover:border-slate-400'
                    }`}
                  >
                    <div
                      class={`w-2 h-2 rounded-full transition-colors ${
                        isActive() ? 'bg-blue-500' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    />
                  </div>

                  {/* 笔记卡片主体 */}
                  <div class="flex flex-col gap-1">
                    {/* 标题与时间行 */}
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class={`text-sm font-semibold truncate flex-1 min-w-0 transition-colors ${
                          isActive()
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-800 dark:text-slate-100 group-hover:text-slate-900'
                        }`}
                      >
                        {note.title || '读书笔记'}
                      </span>
                      <Show when={note.updatedAt}>
                        <span class="text-[10px] text-slate-400 shrink-0">
                          {formatTime(note.updatedAt)}
                        </span>
                      </Show>
                    </div>

                    {/* 引用内容块 */}
                    <div class="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 group-hover:border-slate-300 dark:group-hover:border-zinc-700 transition-colors">
                      <Show when={note.text}>
                        <div class="flex items-start gap-1.5">
                          <IconQuote
                            size={12}
                            class="mt-0.5 shrink-0"
                            style={{ color: note.color || 'var(--color-slate-400, #94a3b8)' }}
                          />
                          <p
                            class="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: note.color || 'inherit' }}
                          >
                            {note.text}
                          </p>
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesTimeline;