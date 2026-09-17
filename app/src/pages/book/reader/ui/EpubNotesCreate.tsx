import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconQuote,
} from '@tabler/icons-solidjs';

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  updatedAt?: number;
}

interface EpubNotesCreateProps {
  newNote?: NewNote;
  onSave: (data: NewNote) => void;
  onCancel?: () => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#facc15' },
  { id: 'purple', name: '淡紫', bg: '#c084fc' },
  { id: 'red', name: '浅红', bg: '#fb7185' },
  { id: 'cyan', name: '青蓝', bg: '#2dd4bf' },
  { id: 'green', name: '草绿', bg: '#a3e635' },
];

const PREF_COLOR_KEY = 'epub_pref_color';

export function EpubNotesCreate(props: EpubNotesCreateProps) {
  const [draft, setDraft] = createSignal<NewNote>({
    book: '',
    index: 0,
    cfiRange: '',
    text: '',
    ...props.newNote,
    color: props.newNote?.color || localStorage.getItem(PREF_COLOR_KEY) || HIGHLIGHT_COLORS[0].bg,
  });

  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);

  createEffect(() => {
    setDraft({
      book: '',
      index: 0,
      cfiRange: '',
      text: '',
      ...props.newNote,
      color: props.newNote?.color || localStorage.getItem(PREF_COLOR_KEY) || HIGHLIGHT_COLORS[0].bg,
    });
  });

  const currentColor = () => draft().color || HIGHLIGHT_COLORS[0].bg;

  const selectedColorObj = () =>
    HIGHLIGHT_COLORS.find((c) => c.bg === currentColor()) || HIGHLIGHT_COLORS[0];

  const handleColorChange = (colorBg: string) => {
    localStorage.setItem(PREF_COLOR_KEY, colorBg);
    setDraft((prev) => ({ ...prev, color: colorBg }));
    setPopoverOpened(false);
  };

  const handleCopy = async () => {
    const text = draft().text;
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
      {/* 顶部标题栏：改为居中对齐 */}
      <div class="flex items-center justify-center gap-2 border-b border-stone-300/60 pb-2">
        <input
          type="text"
          placeholder="输入笔记标题..."
          value={draft().title || ''}
          onInput={(e) => setDraft((prev) => ({ ...prev, title: e.currentTarget.value }))}
          class="w-full font-semibold text-sm bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400 text-center"
        />
      </div>

      <Show when={draft().text}>
        {/* 引用内容卡片 */}
        <div class="relative px-3 py-1.5 rounded-lg border border-stone-300/70 bg-stone-50/50 flex items-center justify-between gap-2 transition-all">
          <div 
            class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-colors duration-200"
            style={{ background: currentColor() }}
          />

          <div class="flex items-center gap-2 flex-1 min-w-0 pl-1">
            <IconQuote size={13} class="shrink-0 text-stone-400" />
            <p class="text-xs text-stone-700 truncate whitespace-nowrap flex-1 font-medium">
              {draft().text}
            </p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 relative">
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
                          onClick={() => handleColorChange(c.bg)}
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

      {/* 底部操作按钮区 */}
      <div class="flex items-center gap-2 pt-1 shrink-0 mt-auto">
        <Show when={props.onCancel}>
          <button
            type="button"
            onClick={props.onCancel}
            class="flex-1 py-1.5 px-3 rounded-lg border border-stone-300/80 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>取消</span>
          </button>
        </Show>
        {/* 保存按钮背景色调整为更轻量协调的石色/浅色系风格 */}
        <button
          type="button"
          onClick={() => props.onSave(draft())}
          class="flex-1 py-1.5 px-3 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <span>保存</span>
        </button>
      </div>
    </div>
  );
}

export default EpubNotesCreate;