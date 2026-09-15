import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconQuote,
  IconDeviceFloppy,
  IconX,
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
  { id: 'yellow', name: '明黄', bg: '#fffa65' },
  { id: 'purple', name: '淡紫', bg: '#cd84f1' },
  { id: 'red', name: '浅红', bg: '#ff4d4d' },
  { id: 'cyan', name: '青蓝', bg: '#7efff5' },
  { id: 'green', name: '草绿', bg: '#2ed573' },
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

  const handleColorChange = (colorBg: string) => {
    localStorage.setItem(PREF_COLOR_KEY, colorBg);
    setDraft((prev) => ({ ...prev, color: colorBg }));
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
    <div class="h-full p-4 pt-6 flex flex-col gap-4 box-border bg-white dark:bg-zinc-900">
      {/* 标题输入框 */}
      <input
        type="text"
        placeholder="输入笔记标题..."
        value={draft().title || ''}
        onInput={(e) => setDraft((prev) => ({ ...prev, title: e.currentTarget.value }))}
        class="w-full font-semibold text-lg text-center bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 opacity-85 focus:opacity-100"
      />

      <hr class="border-slate-200 dark:border-zinc-800 my-1" />

      <Show when={draft().text}>
        <div class="flex flex-col gap-3">
          {/* 颜色选择器组 */}
          <div class="flex items-center gap-2 px-1">
            <For each={HIGHLIGHT_COLORS}>
              {(c) => {
                const isSelected = currentColor() === c.bg;
                return (
                  <button
                    type="button"
                    title={c.name}
                    onClick={() => handleColorChange(c.bg)}
                    class="w-[18px] h-[18px] rounded-full cursor-pointer transition-transform duration-150 border border-black/10 dark:border-white/10"
                    style={{
                      background: c.bg,
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      'box-shadow': isSelected ? '0 0 0 2px var(--color-white, #fff), 0 0 0 4px #3b82f6' : 'none',
                    }}
                  />
                );
              }}
            </For>
          </div>

          {/* 引用内容卡片 */}
          <div class="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
            <div class="flex items-start gap-2.5">
              <IconQuote size={16} class="mt-0.5 shrink-0 text-slate-400" />
              <p
                class="text-sm flex-1 text-slate-700 dark:text-slate-200 opacity-90 break-words rounded px-1 py-0.5"
                style={{ background: currentColor() }}
              >
                {draft().text}
              </p>

              <button
                type="button"
                onClick={handleCopy}
                class="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition-colors text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer"
                title={copied() ? '已复制' : '复制引用'}
              >
                <Show when={copied()} fallback={<IconCopy size={16} />}>
                  <IconCheck size={16} class="text-teal-600 dark:text-teal-400" />
                </Show>
              </button>
            </div>
          </div>

          {/* 底部按钮区 */}
          <div class="flex items-center justify-end gap-2 pt-2">
            <Show when={props.onCancel}>
              <button
                type="button"
                onClick={props.onCancel}
                class="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <IconX size={16} />
                <span>取消</span>
              </button>
            </Show>
            <button
              type="button"
              onClick={() => props.onSave(draft())}
              class="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer shadow-xs"
            >
              <IconDeviceFloppy size={16} />
              <span>保存</span>
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesCreate;