import { createSignal, createEffect, For, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconQuote,
  IconTag,
  IconPlus,
  IconX,
} from '@tabler/icons-solidjs';

// 同步更新接口，增加 tags 数组
export interface NoteItem {
  bookId: string;
  bookName: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  tags?: string[]; // 👈 增加标签字段
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
};

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = createSignal<NoteItem>(
    getInitialNote(props.data, props.notes)
  );
  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);
  
  // 🌟 新增：正在输入的临时标签文本
  const [tagInput, setTagInput] = createSignal('');
  // 🌟 新增：是否正在输入标签的开关状态（控制输入框显隐）
  const [isAddingTag, setIsAddingTag] = createSignal(false);

  createEffect(() => {
    setCurrentNote(getInitialNote(props.data, props.notes));
  });

  const handleFieldChange = (fields: Partial<NoteItem>) => {
    const updated: NoteItem = { ...currentNote(), ...fields, updatedAt: Date.now() };
    setCurrentNote(updated);
    props.onNoteChange(updated);
  };

  // 🌟 标签添加方法
  const handleAddTag = () => {
    const val = tagInput().trim();
    if (!val) return;
    const currentTags = currentNote().tags || [];
    if (currentTags.includes(val)) {
      setTagInput('');
      return;
    }
    handleFieldChange({ tags: [...currentTags, val] });
    setTagInput('');
    setIsAddingTag(false);
  };

  // 🌟 标签删除方法
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = currentNote().tags || [];
    handleFieldChange({ tags: currentTags.filter((t) => t !== tagToRemove) });
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
    <div class="h-full p-3 flex flex-col gap-2.5 box-border bg-transparent text-stone-900 overflow-y-auto">
      {/* 顶部标题栏：居中对齐 */}
      <div class="flex items-center justify-center gap-2 border-b border-stone-300/60 pb-2">
        <input
          type="text"
          placeholder="输入标题..."
          value={currentNote().title || ''}
          onInput={(e) => handleFieldChange({ title: e.currentTarget.value })}
          class="w-full font-semibold text-sm bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400 text-center"
        />
      </div>

      {/* 🌟 标签管理栏 */}
      <div class="flex items-center flex-wrap gap-1.5 min-h-[26px]">
        <IconTag size={12} class="text-stone-400 shrink-0" />
        
        {/* 已有标签列表 */}
        <For each={currentNote().tags || []}>
          {(tag) => (
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stone-200/70 text-stone-700 font-medium group">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                class="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <IconX size={10} />
              </button>
            </span>
          )}
        </For>

        {/* 添加标签输入框或按钮 */}
        <Show
          when={isAddingTag()}
          fallback={
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] border border-dashed border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-400 cursor-pointer transition-colors"
            >
              <IconPlus size={10} />
              <span>添加标签</span>
            </button>
          }
        >
          <div class="inline-flex items-center gap-1">
            <input
              type="text"
              autofocus
              placeholder="回车确认..."
              value={tagInput()}
              onInput={(e) => setTagInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') {
                  setIsAddingTag(false);
                  setTagInput('');
                }
              }}
              onBlur={() => {
                if (tagInput().trim()) handleAddTag();
                else setIsAddingTag(false);
              }}
              class="w-20 px-1.5 py-0.5 rounded border border-stone-400 bg-white text-[11px] outline-none text-stone-800"
            />
          </div>
        </Show>
      </div>

      {/* 引用内容卡片区域 */}
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
        class="flex-1 w-full p-3 rounded-xl border border-stone-300/70 bg-stone-50/60 shadow-2xs text-stone-900 placeholder:text-stone-400 text-xs leading-relaxed resize-none outline-none min-h-[120px]"
      />

      {/* 底部删除按钮 */}
      <Show when={props.onDelete}>
        <div class="pt-1 shrink-0">
          <button
            type="button"
            onClick={() => props.onDelete?.(currentNote().cfiRange)}
            class="w-full py-1.5 px-3 rounded-lg border border-dashed border-stone-300 bg-transparent text-stone-600 text-xs font-medium flex items-center justify-center cursor-pointer"
          >
            删除笔记
          </button>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesEdit;