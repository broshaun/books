import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconQuote,
  IconTag,
  IconPlus,
  IconX,
  IconArrowBackUp,
  IconTrash,
} from '@tabler/icons-solidjs';

export interface NoteItem {
  bookId: string;
  bookName: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  tags?: string[];
  content?: string;
  updatedAt?: number;
}

interface EpubNotesEditProps {
  data?: NoteItem | null;
  notes?: NoteItem | null;
  onNoteChange: (data: NoteItem) => void;
  onDelete?: (cfiRange: string) => void;
  onBack?: () => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#facc15' },
  { id: 'purple', name: '淡紫', bg: '#c084fc' },
  { id: 'red', name: '浅红', bg: '#fb7185' },
  { id: 'cyan', name: '青蓝', bg: '#2dd4bf' },
  { id: 'green', name: '草绿', bg: '#a3e635' },
];

const getInitialNote = (data?: NoteItem | null, notes?: NoteItem | null): NoteItem =>
  data || notes || {
    bookId: '',
    bookName: '',
    index: Date.now(),
    title: '读书笔记',
    cfiRange: '',
    text: '',
    color: HIGHLIGHT_COLORS[0].bg,
    tags: [],
    content: '',
  };

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = createSignal<NoteItem>(
    getInitialNote(props.data, props.notes)
  );
  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);
  const [tagInput, setTagInput] = createSignal('');
  const [isAddingTag, setIsAddingTag] = createSignal(false);

  let textareaRef: HTMLTextAreaElement | undefined;

  // 自动调整 textarea 高度函数
  const adjustTextareaHeight = () => {
    if (!textareaRef) return;
    textareaRef.style.height = 'auto';
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  };

  createEffect(() => {
    setCurrentNote(getInitialNote(props.data, props.notes));
    // 当外部数据重置/切换时，同步调整输入框高度
    setTimeout(adjustTextareaHeight, 0);
  });

  const updateNote = (fields: Partial<NoteItem>) => {
    const updated = { ...currentNote(), ...fields, updatedAt: Date.now() };
    setCurrentNote(updated);
    props.onNoteChange(updated);
  };

  const handleAddTag = () => {
    const val = tagInput().trim();
    if (!val) return;
    const tags = currentNote().tags || [];
    if (!tags.includes(val)) {
      updateNote({ tags: [...tags, val] });
    }
    setTagInput('');
    setIsAddingTag(false);
  };

  const currentColor = () => currentNote().color || HIGHLIGHT_COLORS[0].bg;
  const selectedColorObj = () => HIGHLIGHT_COLORS.find((c) => c.bg === currentColor()) || HIGHLIGHT_COLORS[0];

  return (
    <div class="h-full p-3 flex flex-col gap-2.5 bg-stone-50/40 text-stone-900 overflow-y-auto">
      {/* 顶部导航与标题栏 */}
      <div class="flex items-start gap-2">
        <Show when={props.onBack}>
          <button
            type="button"
            onClick={props.onBack}
            class="p-1.5 rounded-lg hover:bg-stone-200/70 text-stone-600 transition-colors cursor-pointer shrink-0"
            title="返回"
          >
            <IconArrowBackUp size={18} />
          </button>
        </Show>
        <div class="flex-1 pb-2 border-b border-stone-200">
          <input
            type="text"
            placeholder="输入笔记标题..."
            value={currentNote().title || ''}
            onInput={(e) => updateNote({ title: e.currentTarget.value })}
            class="w-full font-semibold text-sm bg-transparent border-none outline-none text-stone-800 placeholder:text-stone-400 text-center px-1"
          />
        </div>
      </div>

      {/* 标签管理区 */}
      <div class="flex items-center flex-wrap gap-1.5">
        <IconTag size={13} class="text-stone-400 shrink-0" />
        <For each={currentNote().tags || []}>
          {(tag) => (
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stone-200/70 text-stone-700 font-medium">
              {tag}
              <button
                type="button"
                onClick={() => updateNote({ tags: (currentNote().tags || []).filter((t) => t !== tag) })}
                class="hover:text-red-500 cursor-pointer"
              >
                <IconX size={11} />
              </button>
            </span>
          )}
        </For>
        <Show
          when={isAddingTag()}
          fallback={
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border border-dashed border-stone-300 text-stone-500 hover:text-stone-700 hover:border-stone-400 cursor-pointer transition-colors"
            >
              <IconPlus size={11} />
              <span>添加标签</span>
            </button>
          }
        >
          <input
            type="text"
            autofocus
            placeholder="回车确认..."
            value={tagInput()}
            onInput={(e) => setTagInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') { setIsAddingTag(false); setTagInput(''); }
            }}
            onBlur={handleAddTag}
            class="w-24 px-2 py-0.5 rounded-md border border-stone-300 bg-white text-[11px] outline-none text-stone-800"
          />
        </Show>
      </div>

      {/* 引用内容卡片 */}
      <Show when={currentNote().text}>
        <div class="relative px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white shadow-2xs flex items-center justify-between gap-2.5">
          <div class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ background: currentColor() }} />
          <div class="flex items-center gap-2 flex-1 min-w-0 pl-1">
            <IconQuote size={13} class="shrink-0 text-stone-400" />
            <p class="text-xs text-stone-700 truncate font-medium">{currentNote().text}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 relative">
            <button
              type="button"
              onClick={() => setPopoverOpened(!popoverOpened())}
              class="p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer"
              title="选择高亮颜色"
            >
              <div class="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs" style={{ 'background-color': selectedColorObj().bg }} />
            </button>
            <Show when={popoverOpened()}>
              <div class="absolute right-0 top-full mt-1.5 p-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 flex flex-col gap-2 min-w-[130px]">
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-0.5">高亮色彩</span>
                <div class="flex items-center gap-1.5 px-0.5">
                  <For each={HIGHLIGHT_COLORS}>
                    {(c) => (
                      <button
                        type="button"
                        title={c.name}
                        onClick={() => { updateNote({ color: c.bg }); setPopoverOpened(false); }}
                        class="w-4.5 h-4.5 rounded-full border border-stone-300 cursor-pointer hover:scale-110 transition-transform"
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
            <button
              type="button"
              onClick={async () => {
                if (!currentNote().text) return;
                await navigator.clipboard.writeText(currentNote().text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              class="p-1 rounded hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700 cursor-pointer"
              title="复制引用"
            >
              <Show when={copied()} fallback={<IconCopy size={13} />}>
                <IconCheck size={13} class="text-emerald-600" />
              </Show>
            </button>
          </div>
        </div>
      </Show>

      {/* 最小为 5 行、多于 5 行自适应拓展高度的心得输入框 */}
      <textarea
        ref={textareaRef}
        rows={5}
        placeholder="记录读书心得与思考..."
        value={currentNote().content || ''}
        onInput={(e) => {
          updateNote({ content: e.currentTarget.value });
          adjustTextareaHeight();
        }}
        class="w-full p-2.5 rounded-xl border border-stone-200 bg-white shadow-2xs text-stone-900 placeholder:text-stone-400 text-xs leading-relaxed resize-none outline-none focus:border-stone-400 transition-colors overflow-hidden"
      />

      {/* 底部删除按钮 */}
      <Show when={props.onDelete}>
        <div class="pt-0.5">
          <button
            type="button"
            onClick={() => props.onDelete?.(currentNote().cfiRange)}
            class="w-full py-1.5 px-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 text-red-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <IconTrash size={13} />
            <span>删除笔记</span>
          </button>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesEdit;