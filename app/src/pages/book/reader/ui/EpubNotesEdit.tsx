import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconQuote,
} from '@tabler/icons-solidjs';

export interface NoteItem {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  content?: string;
  updatedAt?: number;
}

interface EpubNotesEditProps {
  data?: NoteItem | null;
  notes?: NoteItem | null;
  onNoteChange: (data: NoteItem) => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#facc15' },
  { id: 'purple', name: '淡紫', bg: '#c084fc' },
  { id: 'red', name: '浅红', bg: '#fb7185' },
  { id: 'cyan', name: '青蓝', bg: '#2dd4bf' },
  { id: 'green', name: '草绿', bg: '#a3e635' },
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
    <div class="h-full p-3 flex flex-col gap-2.5 box-border bg-transparent text-stone-900">
      {/* 顶部标题栏（纯输入框） */}
      <div class="flex items-center justify-between gap-2 border-b border-stone-300/60 pb-2">
        <input
          type="text"
          placeholder="输入标题..."
          value={currentNote().title || ''}
          onInput={(e) => handleFieldChange({ title: e.currentTarget.value })}
          class="w-full font-semibold text-sm bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400"
        />
      </div>

      {/* 引用内容卡片区域（颜色选择器已移入此处） */}
      <Show when={currentNote().text}>
        <div class="relative px-3 py-1.5 rounded-lg border border-stone-300/70 bg-stone-50/50 flex items-center justify-between gap-2 transition-all">
          <div 
            class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-colors duration-200"
            style={{ background: currentNote().color || HIGHLIGHT_COLORS[0].bg }}
          />

          <div class="flex items-center gap-2 flex-1 min-w-0 pl-1">
            <IconQuote size={13} class="shrink-0 text-stone-400" />
            <p class="text-xs text-stone-700 truncate whitespace-nowrap flex-1 font-medium">
              {currentNote().text}
            </p>
          </div>

          {/* 右侧工具栏：颜色选择器 + 复制按钮 */}
          <div class="flex items-center gap-1.5 shrink-0 relative">
            {/* 颜色选择 Popover */}
            <div class="relative">
              <button
                type="button"
                title="选择高亮颜色"
                onClick={() => setPopoverOpened(!popoverOpened())}
                class="p-1 rounded hover:bg-stone-200/60 transition-colors cursor-pointer flex items-center"
              >
                <div 
                  class="w-3.5 h-3.5 rounded-full border border-stone-400 shadow-2xs"
                  style={{ 'background-color': selectedColorObj().bg }}
                />
              </button>

              <Show when={popoverOpened()}>
                <div class="absolute right-0 top-full mt-1.5 p-2 bg-white border border-stone-300 rounded-xl shadow-xl z-20 flex flex-col gap-1.5 min-w-[130px]">
                  <span class="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1">
                    标记高亮色彩
                  </span>
                  <div class="flex items-center gap-1.5 px-1">
                    <For each={HIGHLIGHT_COLORS}>
                      {(c) => (
                        <button
                          type="button"
                          title={c.name}
                          onClick={() => {
                            handleFieldChange({ color: c.bg });
                            setPopoverOpened(false);
                          }}
                          class="w-4.5 h-4.5 rounded-full border border-stone-400/80 cursor-pointer transition-transform hover:scale-115"
                          style={{
                            'background-color': c.bg,
                            outline: selectedColorObj().id === c.id ? '2px solid #57534e' : 'none',
                            'outline-offset': '1px',
                          }}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* 复制按钮 */}
            <button
              type="button"
              title={copied() ? '已复制' : '复制引用'}
              onClick={handleCopy}
              class="p-1 rounded hover:bg-stone-200/60 transition-colors text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <Show when={copied()} fallback={<IconCopy size={13} />}>
                <IconCheck size={13} class="text-emerald-700" />
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
        class="flex-1 w-full p-3 rounded-xl border border-stone-300/70 bg-white shadow-2xs text-stone-900 placeholder:text-stone-400 text-xs leading-relaxed resize-none focus:outline-none focus:border-stone-500 transition-colors"
      />
    </div>
  );
}

export default EpubNotesEdit;