import { createSignal, createEffect, For, Show } from "solid-js";
import { IconCopy, IconCheck, IconQuote, IconTag, IconX, IconTrash } from "@tabler/icons-solidjs";

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
  onDelete?: (data: NoteItem) => void;
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "明黄", bg: "#facc15" },
  { id: "purple", name: "淡紫", bg: "#c084fc" },
  { id: "red", name: "浅红", bg: "#fb7185" },
  { id: "cyan", name: "青蓝", bg: "#2dd4bf" },
  { id: "green", name: "草绿", bg: "#a3e635" },
];

const getFallbackNote = (d?: NoteItem | null, n?: NoteItem | null): NoteItem =>
  d || n || {
    bookId: "", bookName: "", index: Date.now(), title: "读书笔记",
    cfiRange: "", text: "", color: HIGHLIGHT_COLORS[0].bg, tags: [], content: "",
  };

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [note, setNote] = createSignal<NoteItem>(getFallbackNote(props.data, props.notes));
  const [copied, setCopied] = createSignal(false);
  const [popover, setPopover] = createSignal(false);
  const [tagInput, setTagInput] = createSignal("");

  let textareaRef: HTMLTextAreaElement | undefined;

  const autoHeight = () => {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  };

  createEffect(() => {
    setNote(getFallbackNote(props.data, props.notes));
    setTagInput("");
    setPopover(false);
    setTimeout(autoHeight, 0);
  });

  const patchNote = (fields: Partial<NoteItem>) => {
    const updated = { ...note(), ...fields, updatedAt: Date.now() };
    setNote(updated);
    props.onNoteChange(updated);
  };

  const currentColor = () => note().color || HIGHLIGHT_COLORS[0].bg;

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!note().text) return;
    try {
      await navigator.clipboard.writeText(note().text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleKeyTag = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = tagInput().trim();
    if (!val) return;
    const tags = note().tags || [];
    if (!tags.includes(val)) patchNote({ tags: [...tags, val] });
    setTagInput("");
  };

  return (
    <div class="h-full w-full px-2.5 pt-1.5 pb-2 flex flex-col gap-1.5 bg-transparent text-stone-900 overflow-y-auto box-border select-none">
      {/* 标题栏 */}
      <div class="relative flex items-center justify-center border-b border-stone-300/60 pb-1">
        <input
          type="text"
          placeholder="输入笔记标题..."
          value={note().title || ""}
          onInput={(e) => patchNote({ title: e.currentTarget.value })}
          class="w-full bg-transparent text-center text-sm font-semibold text-stone-900 placeholder:text-stone-400 border-none outline-none py-0.5 px-6"
        />
        <Show when={props.onDelete}>
          <button
            type="button"
            title="删除"
            onClick={(e) => { e.stopPropagation(); props.onDelete?.(note()); }}
            class="absolute right-0 cursor-pointer p-1 text-stone-400 hover:text-red-500 transition-colors"
          >
            <IconTrash size={15} />
          </button>
        </Show>
      </div>

      {/* 标签栏 */}
      <div class="flex items-center flex-wrap gap-1.5">
        <IconTag size={13} class="text-stone-400 shrink-0" />
        <For each={note().tags || []}>
          {(tag) => (
            <span class="inline-flex items-center gap-1 rounded-md bg-stone-200/70 px-2 py-0.5 text-[11px] text-stone-700">
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); patchNote({ tags: (note().tags || []).filter((t) => t !== tag) }); }}
                class="cursor-pointer hover:text-red-500"
              >
                <IconX size={12} />
              </button>
            </span>
          )}
        </For>
        <input
          type="text"
          placeholder="添加标签..."
          value={tagInput()}
          onInput={(e) => setTagInput(e.currentTarget.value)}
          onKeyDown={handleKeyTag}
          class="w-24 rounded-md border border-stone-300/70 bg-stone-50/30 px-2 py-0.5 text-xs text-stone-800 outline-none focus:border-stone-400"
        />
      </div>

      {/* 引用卡片 */}
      <Show when={note().text}>
        <div class="relative flex items-center justify-between gap-2 rounded-lg border border-stone-300/70 bg-stone-50/50 px-3 py-1.5">
          <div class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ "background-color": currentColor() }} />
          <div class="flex min-w-0 flex-1 items-center gap-2 pl-1">
            <IconQuote size={13} class="shrink-0 text-stone-400" />
            <p class="min-w-0 flex-1 truncate whitespace-nowrap text-xs font-medium text-stone-700">
              {note().text}
            </p>
          </div>

          <div class="relative flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPopover((v) => !v); }}
              class="flex cursor-pointer items-center rounded p-1 hover:bg-stone-200/60"
            >
              <div class="h-3.5 w-3.5 rounded-full border border-stone-400" style={{ "background-color": currentColor() }} />
            </button>

            <Show when={popover()}>
              <div class="absolute right-0 top-full z-20 mt-1.5 flex flex-col gap-1.5 rounded-xl border border-stone-300 bg-white p-2 shadow-xl">
                <span class="px-1 text-[10px] font-bold text-stone-500">高亮颜色</span>
                <div class="flex items-center gap-1.5 px-1">
                  <For each={HIGHLIGHT_COLORS}>
                    {(c) => (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); patchNote({ color: c.bg }); setPopover(false); }}
                        class="h-4.5 w-4.5 cursor-pointer rounded-full border border-stone-400/80"
                        style={{ "background-color": c.bg, outline: currentColor() === c.bg ? "2px solid #57534e" : "none", "outline-offset": "1px" }}
                      />
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <button
              type="button"
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
        rows={4}
        placeholder="记录读书心得与思考..."
        value={note().content || ""}
        onInput={(e) => { patchNote({ content: e.currentTarget.value }); autoHeight(); }}
        class="w-full rounded-md border border-stone-300/70 bg-stone-50/30 p-2.5 text-xs text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 resize-none overflow-hidden"
      />
    </div>
  );
}

export default EpubNotesEdit;