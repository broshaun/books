import { createSignal, createEffect, For, Show } from "solid-js";
import { IconCopy, IconCheck, IconQuote, IconTag, IconX } from "@tabler/icons-solidjs";

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
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "明黄", bg: "#facc15" },
  { id: "purple", name: "淡紫", bg: "#c084fc" },
  { id: "red", name: "浅红", bg: "#fb7185" },
  { id: "cyan", name: "青蓝", bg: "#2dd4bf" },
  { id: "green", name: "草绿", bg: "#a3e635" },
];

const getInitialNote = (data?: NoteItem | null, notes?: NoteItem | null): NoteItem =>
  data || notes || {
    bookId: "",
    bookName: "",
    index: Date.now(),
    title: "读书笔记",
    cfiRange: "",
    text: "",
    color: HIGHLIGHT_COLORS[0].bg,
    tags: [],
    content: "",
  };

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = createSignal<NoteItem>(getInitialNote(props.data, props.notes));
  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);
  const [tagInput, setTagInput] = createSignal("");

  let textareaRef: HTMLTextAreaElement | undefined;

  const adjustTextareaHeight = () => {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  };

  createEffect(() => {
    setCurrentNote(getInitialNote(props.data, props.notes));
    setTagInput("");
    setPopoverOpened(false);
    setTimeout(adjustTextareaHeight, 0);
  });

  const updateNote = (fields: Partial<NoteItem>) => {
    const updated = { ...currentNote(), ...fields, updatedAt: Date.now() };
    setCurrentNote(updated);
    props.onNoteChange(updated);
  };

  const currentColor = () => currentNote().color || HIGHLIGHT_COLORS[0].bg;

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!currentNote().text) return;
    try {
      await navigator.clipboard.writeText(currentNote().text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("复制引用失败:", err);
    }
  };

  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = tagInput().trim();
    if (!val) return;
    const tags = currentNote().tags || [];
    if (!tags.includes(val)) {
      updateNote({ tags: [...tags, val] });
    }
    setTagInput("");
  };

  return (
    <div class="h-full w-full px-2.5 pt-1.5 pb-2 flex flex-col gap-1.5 bg-transparent text-stone-900 overflow-y-auto box-border">
      {/* 标题栏 */}
      <div class="flex items-center justify-center gap-2 border-b border-stone-300/60 pb-1">
        <input
          type="text"
          placeholder="输入笔记标题..."
          value={currentNote().title || ""}
          onInput={(e) => updateNote({ title: e.currentTarget.value })}
          class="w-full bg-transparent text-center text-sm font-semibold text-stone-900 placeholder:text-stone-400 border-none outline-none py-0.5"
        />
      </div>

      {/* 标签管理 */}
      <div class="flex items-center flex-wrap gap-1.5">
        <IconTag size={13} class="text-stone-400 shrink-0" />
        <For each={currentNote().tags || []}>
          {(tag) => (
            <span class="inline-flex items-center gap-1 rounded-md bg-stone-200/70 px-2 py-0.5 text-[11px] text-stone-700">
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNote({ tags: (currentNote().tags || []).filter((t) => t !== tag) });
                }}
                class="cursor-pointer hover:text-red-500"
              >
                <IconX size={12} />
              </button>
            </span>
          )}
        </For>
        <input
          type="text"
          placeholder="添加标签（回车添加）..."
          value={tagInput()}
          onInput={(e) => setTagInput(e.currentTarget.value)}
          onKeyDown={handleAddTag}
          class="w-28 rounded-md border border-stone-300/70 bg-stone-50/30 px-2 py-0.5 text-xs text-stone-800 outline-none focus:border-stone-400"
        />
      </div>

      {/* 引用内容卡片 */}
      <Show when={currentNote().text}>
        <div class="relative flex items-center justify-between gap-2 rounded-lg border border-stone-300/70 bg-stone-50/50 px-3 py-1.5">
          <div class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ "background-color": currentColor() }} />
          <div class="flex min-w-0 flex-1 items-center gap-2 pl-1">
            <IconQuote size={13} class="shrink-0 text-stone-400" />
            <p class="min-w-0 flex-1 truncate whitespace-nowrap text-xs font-medium text-stone-700">
              {currentNote().text}
            </p>
          </div>

          <div class="relative flex shrink-0 items-center gap-1.5">
            {/* 色彩切换 */}
            <div class="relative">
              <button
                type="button"
                title="选择高亮颜色"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpened((v) => !v);
                }}
                class="flex cursor-pointer items-center rounded p-1 hover:bg-stone-200/60"
              >
                <div class="h-3.5 w-3.5 rounded-full border border-stone-400" style={{ "background-color": currentColor() }} />
              </button>

              <Show when={popoverOpened()}>
                <div class="absolute right-0 top-full z-20 mt-1.5 flex min-w-[150px] flex-col gap-1.5 rounded-xl border border-stone-300 bg-white p-2 shadow-xl">
                  <span class="px-1 text-[10px] font-bold text-stone-500">标记高亮色彩</span>
                  <div class="flex flex-wrap items-center gap-1.5 px-1">
                    <For each={HIGHLIGHT_COLORS}>
                      {(c) => (
                        <button
                          type="button"
                          title={c.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateNote({ color: c.bg });
                            setPopoverOpened(false);
                          }}
                          class="h-4.5 w-4.5 cursor-pointer rounded-full border border-stone-400/80"
                          style={{
                            "background-color": c.bg,
                            outline: currentColor() === c.bg ? "2px solid #57534e" : "none",
                            "outline-offset": "1px",
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
              title={copied() ? "已复制" : "复制引用"}
              onClick={handleCopy}
              class="cursor-pointer rounded p-1 text-stone-400 hover:text-stone-700"
            >
              <Show when={copied()} fallback={<IconCopy size={13} />}>
                <IconCheck size={13} class="text-emerald-700" />
              </Show>
            </button>
          </div>
        </div>
      </Show>

      {/* 心得输入框 */}
      <textarea
        ref={textareaRef}
        rows={5}
        placeholder="记录读书心得与思考..."
        value={currentNote().content || ""}
        onInput={(e) => {
          updateNote({ content: e.currentTarget.value });
          adjustTextareaHeight();
        }}
        class="w-full rounded-md border border-stone-300/70 bg-stone-50/30 p-2.5 text-xs text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 resize-none overflow-hidden"
      />
    </div>
  );
}

export default EpubNotesEdit;