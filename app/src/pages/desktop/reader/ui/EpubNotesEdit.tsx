
import {
  createSignal,
  createEffect,
  For,
  Show,
} from "solid-js";

import {
  IconCopy,
  IconCheck,
  IconQuote,
  IconTag,
  IconPlus,
  IconX,
} from "@tabler/icons-solidjs";

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
  onDelete?: (cfiRange: string) => void | Promise<void>;
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "明黄", bg: "#facc15" },
  { id: "purple", name: "淡紫", bg: "#c084fc" },
  { id: "red", name: "浅红", bg: "#fb7185" },
  { id: "cyan", name: "青蓝", bg: "#2dd4bf" },
  { id: "green", name: "草绿", bg: "#a3e635" },
];

const getInitialNote = (
  data?: NoteItem | null,
  notes?: NoteItem | null
): NoteItem => {
  const source = data || notes;

  if (source) {
    return {
      ...source,
      tags: [...(source.tags || [])],
    };
  }

  return {
    bookId: "",
    bookName: "",
    index: 0,
    title: "读书笔记",
    cfiRange: "",
    text: "",
    color: HIGHLIGHT_COLORS[0].bg,
    tags: [],
    content: "",
  };
};

export function EpubNotesEdit(props: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = createSignal<NoteItem>(
    getInitialNote(props.data, props.notes)
  );

  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);
  const [tagInput, setTagInput] = createSignal("");
  const [isAddingTag, setIsAddingTag] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);

  // 外部切换笔记时同步数据
  createEffect(() => {
    const data = props.data;
    const notes = props.notes;

    setCurrentNote(getInitialNote(data, notes));
    setTagInput("");
    setIsAddingTag(false);
    setPopoverOpened(false);
    setIsDeleting(false);
  });

  // 更新字段并通知父组件
  const handleFieldChange = (fields: Partial<NoteItem>) => {
    if (isDeleting()) return;

    const updated: NoteItem = {
      ...currentNote(),
      ...fields,
      updatedAt: Date.now(),
    };

    setCurrentNote(updated);
    props.onNoteChange(updated);
  };

  // 添加标签
  const handleAddTag = () => {
    const val = tagInput().trim();

    if (!val) {
      setIsAddingTag(false);
      return;
    }

    const currentTags = currentNote().tags || [];

    if (!currentTags.includes(val)) {
      handleFieldChange({
        tags: [...currentTags, val],
      });
    }

    setTagInput("");
    setIsAddingTag(false);
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = currentNote().tags || [];

    handleFieldChange({
      tags: currentTags.filter(
        (tag) => tag !== tagToRemove
      ),
    });
  };

  const selectedColorObj = () =>
    HIGHLIGHT_COLORS.find(
      (c) =>
        c.bg ===
        (currentNote().color || HIGHLIGHT_COLORS[0].bg)
    ) || HIGHLIGHT_COLORS[0];

  // 复制引用
  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();

    const text = currentNote().text;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.warn("复制引用失败:", err);
    }
  };

  // 删除笔记
  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDeleting()) return;

    const cfiRange = currentNote().cfiRange;

    console.log(
      "[EpubNotesEdit] 删除按钮已点击:",
      cfiRange
    );

    if (!cfiRange) {
      console.warn(
        "[EpubNotesEdit] 删除失败：缺少 cfiRange"
      );
      return;
    }

    if (!props.onDelete) {
      console.warn(
        "[EpubNotesEdit] 删除失败：未提供 onDelete 回调"
      );
      return;
    }

    setIsDeleting(true);

    try {
      await props.onDelete(cfiRange);

      console.log(
        "[EpubNotesEdit] 删除回调执行完成:",
        cfiRange
      );
    } catch (error) {
      console.error(
        "[EpubNotesEdit] 删除笔记失败:",
        error
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div class="flex min-h-0 flex-col gap-2.5 box-border bg-transparent p-3 text-stone-900">

      {/* 顶部标题栏 */}
      <div class="flex shrink-0 items-center justify-center gap-2 border-b border-stone-300/60 pb-2">
        <input
          type="text"
          placeholder="输入标题..."
          value={currentNote().title || ""}
          onInput={(e) =>
            handleFieldChange({
              title: e.currentTarget.value,
            })
          }
          class="w-full bg-transparent text-center text-sm font-semibold text-stone-900 placeholder:text-stone-400 border-none outline-none"
        />
      </div>

      {/* 标签管理 */}
      <div class="flex min-h-[26px] shrink-0 flex-wrap items-center gap-1.5">

        <IconTag
          size={12}
          class="shrink-0 text-stone-400"
        />

        <For each={currentNote().tags || []}>
          {(tag) => (
            <span class="group inline-flex items-center gap-1 rounded-md bg-stone-200/70 px-2 py-0.5 text-[11px] font-medium text-stone-700">

              <span>{tag}</span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag);
                }}
                class="cursor-pointer text-stone-400 hover:text-stone-700"
              >
                <IconX size={10} />
              </button>

            </span>
          )}
        </For>

        <Show
          when={isAddingTag()}
          fallback={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingTag(true);
              }}
              class="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-dashed border-stone-300 px-2 py-0.5 text-[11px] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
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
              onInput={(e) =>
                setTagInput(e.currentTarget.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }

                if (e.key === "Escape") {
                  setIsAddingTag(false);
                  setTagInput("");
                }
              }}
              onBlur={() => {
                if (tagInput().trim()) {
                  handleAddTag();
                } else {
                  setIsAddingTag(false);
                }
              }}
              class="w-20 rounded border border-stone-400 bg-white px-1.5 py-0.5 text-[11px] text-stone-800 outline-none"
            />
          </div>
        </Show>
      </div>

      {/* 引用内容卡片 */}
      <Show when={currentNote().text}>
        <div class="relative flex shrink-0 items-center justify-between gap-2 rounded-lg border border-stone-300/70 bg-stone-50/50 px-3 py-1.5">

          <div
            class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
            style={{
              background:
                currentNote().color ||
                HIGHLIGHT_COLORS[0].bg,
            }}
          />

          <div class="flex min-w-0 flex-1 items-center gap-2 pl-1">

            <IconQuote
              size={13}
              class="shrink-0 text-stone-400"
            />

            <p class="min-w-0 flex-1 truncate whitespace-nowrap text-xs font-medium text-stone-700">
              {currentNote().text}
            </p>
          </div>

          <div class="relative flex shrink-0 items-center gap-1.5">

            {/* 高亮颜色 */}
            <div class="relative">
              <button
                type="button"
                title="选择高亮颜色"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpened(
                    (opened) => !opened
                  );
                }}
                class="flex cursor-pointer items-center rounded p-1 transition-colors hover:bg-stone-200/60"
              >
                <div
                  class="h-3.5 w-3.5 rounded-full border border-stone-400"
                  style={{
                    "background-color":
                      selectedColorObj().bg,
                  }}
                />
              </button>

              <Show when={popoverOpened()}>
                <div class="absolute right-0 top-full z-20 mt-1.5 flex min-w-[130px] flex-col gap-1.5 rounded-xl border border-stone-300 bg-white p-2 shadow-xl">

                  <span class="px-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    标记高亮色彩
                  </span>

                  <div class="flex items-center gap-1.5 px-1">
                    <For each={HIGHLIGHT_COLORS}>
                      {(c) => (
                        <button
                          type="button"
                          title={c.name}
                          onClick={(e) => {
                            e.stopPropagation();

                            handleFieldChange({
                              color: c.bg,
                            });

                            setPopoverOpened(false);
                          }}
                          class="h-4.5 w-4.5 cursor-pointer rounded-full border border-stone-400/80 transition-transform hover:scale-110"
                          style={{
                            "background-color": c.bg,
                            outline:
                              selectedColorObj().id === c.id
                                ? "2px solid #57534e"
                                : "none",
                            "outline-offset": "1px",
                          }}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* 复制引用 */}
            <button
              type="button"
              title={copied() ? "已复制" : "复制引用"}
              onClick={handleCopy}
              class="cursor-pointer rounded p-1 text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
            >
              <Show
                when={copied()}
                fallback={<IconCopy size={13} />}
              >
                <IconCheck
                  size={13}
                  class="text-emerald-700"
                />
              </Show>
            </button>
          </div>
        </div>
      </Show>

      {/* 读书心得 */}
      <textarea
        placeholder="在此记录读书心得..."
        value={currentNote().content || ""}
        onInput={(e) =>
          handleFieldChange({
            content: e.currentTarget.value,
          })
        }
        class="min-h-[120px] w-full flex-1 resize-none rounded-xl border border-stone-300/70 bg-stone-50/60 p-3 text-xs leading-relaxed text-stone-900 shadow-2xs placeholder:text-stone-400 outline-none"
      />

      {/* 删除笔记 */}
      <Show when={props.onDelete}>
        <div class="shrink-0 pt-2">
          <button
            type="button"
            disabled={isDeleting()}
            onClick={handleDelete}
            class="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-stone-300 bg-transparent px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting() ? "正在删除..." : "删除笔记"}
          </button>
        </div>
      </Show>
    </div>
  );
}

export default EpubNotesEdit;
