import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconUnderline,
  IconCheck,
  IconQuote,
  IconTrash,
} from '@tabler/icons-solidjs';

export interface NoteItem {
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

interface EpubNotesEditProps {
  data?: NoteItem | null;
  notes?: NoteItem | null;
  onNoteChange: (data: NoteItem) => void;
  onDelete?: (cfiRange: string) => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#fffa65' },
  { id: 'purple', name: '淡紫', bg: '#cd84f1' },
  { id: 'red', name: '浅红', bg: '#ff4d4d' },
  { id: 'cyan', name: '青蓝', bg: '#7efff5' },
  { id: 'green', name: '草绿', bg: '#2ed573' },
];

const getInitialNote = (data?: NoteItem | null, notes?: NoteItem | null): NoteItem => {
  if (data) return data;
  if (notes) return notes;
  return {
    book: '',
    index: Date.now(),
    title: '读书笔记',
    cfiRange: '',
    text: '',
    color: HIGHLIGHT_COLORS[0].bg,
    isUnderline: false,
    content: '',
  };
};

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = createSignal<NoteItem>(
    getInitialNote(props.data, props.notes)
  );
  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);

  createEffect(() => {
    setCurrentNote(getInitialNote(props.data, props.notes));
  });

  const handleFieldChange = (fields: Partial<NoteItem>) => {
    const updated: NoteItem = { ...currentNote(), ...fields, updatedAt: Date.now() };
    setCurrentNote(updated);
    props.onNoteChange(updated);
  };

  const selectedColorObj = () =>
    HIGHLIGHT_COLORS.find((c) => c.bg === (currentNote().color || HIGHLIGHT_COLORS[0].bg)) ||
    HIGHLIGHT_COLORS[0];

  const handleCopy = async () => {
    const text = currentNote().text;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <div class="h-full p-4 flex flex-col gap-3 box-border bg-white dark:bg-zinc-900">
      {/* 顶部标题栏 & 删除按钮 */}
      <div class="flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="输入标题..."
          value={currentNote().title || ''}
          onInput={(e) => handleFieldChange({ title: e.currentTarget.value })}
          class="w-full font-bold text-lg text-center bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
        <Show when={props.onDelete}>
          <button
            type="button"
            title="删除笔记"
            onClick={() => {
              const range = currentNote().cfiRange;
              if (range) props.onDelete?.(range);
            }}
            class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 cursor-pointer shrink-0 transition-colors"
          >
            <IconTrash size={16} />
          </button>
        </Show>
      </div>

      {/* 引用内容卡片区域 */}
      <Show when={currentNote().text}>
        <div class="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between gap-2">
          <div class="flex items-start gap-2 flex-1 min-w-0">
            <IconQuote size={14} class="mt-0.5 shrink-0 text-slate-400" />
            <p
              class="text-xs line-clamp-2 leading-relaxed text-slate-700 dark:text-slate-300 flex-1 break-words rounded px-1 py-0.5"
              style={{
                background: currentNote().color || 'transparent',
                'text-decoration': currentNote().isUnderline ? 'underline' : 'none',
              }}
            >
              {currentNote().text}
            </p>
          </div>

          {/* 操作工具栏：颜色盘、下划线、复制 */}
          <div class="flex items-center gap-1 shrink-0 relative">
            {/* 颜色选择 Popover */}
            <div class="relative">
              <button
                type="button"
                title="选择高亮颜色"
                onClick={() => setPopoverOpened(!popoverOpened())}
                class="w-4 h-4 rounded-full border border-black/20 cursor-pointer transition-transform hover:scale-110"
                style={{ 'background-color': selectedColorObj().bg }}
              />

              <Show when={popoverOpened()}>
                <div class="absolute right-0 top-full mt-2 p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-20 flex flex-col gap-1.5 min-w-[120px]">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    高亮色彩
                  </span>
                  <div class="flex items-center gap-1.5">
                    <For each={HIGHLIGHT_COLORS}>
                      {(c) => (
                        <button
                          type="button"
                          title={c.name}
                          onClick={() => {
                            handleFieldChange({ color: c.bg });
                            setPopoverOpened(false);
                          }}
                          class="w-5 h-5 rounded-full border border-black/10 cursor-pointer transition-transform hover:scale-115"
                          style={{
                            'background-color': c.bg,
                            outline: selectedColorObj().id === c.id ? '2px solid #3b82f6' : 'none',
                            'outline-offset': '1px',
                          }}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* 下划线控制 */}
            <button
              type="button"
              title={currentNote().isUnderline ? '取消下划线' : '添加下划线'}
              onClick={() => handleFieldChange({ isUnderline: !currentNote().isUnderline })}
              class={`p-1 rounded cursor-pointer transition-colors ${
                currentNote().isUnderline
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              <IconUnderline size={14} />
            </button>

            {/* 复制按钮 */}
            <button
              type="button"
              title={copied() ? '已复制' : '复制引用'}
              onClick={handleCopy}
              class="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <Show when={copied()} fallback={<IconCopy size={14} />}>
                <IconCheck size={14} class="text-teal-600 dark:text-teal-400" />
              </Show>
            </button>
          </div>
        </div>
      </Show>

      {/* 笔记心得输入文本域 */}
      <textarea
        placeholder="在此记录读书心得..."
        value={currentNote().content || ''}
        onInput={(e) => handleFieldChange({ content: e.currentTarget.value })}
        class="flex-1 w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
    </div>
  );
}

export default EpubNotesEdit;