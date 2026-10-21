
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
  IconX,
} from "@tabler/icons-solidjs";

export interface NewNote {
  book?: string;
  bookId?: string;
  bookName?: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  tags?: string[];
  updatedAt?: number;
}

interface EpubNotesCreateProps {
  newNote?: NewNote;
  onSave: (data: NewNote) => void;
  onCancel?: () => void;
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "明黄", bg: "#facc15" },
  { id: "purple", name: "淡紫", bg: "#c084fc" },
  { id: "red", name: "浅红", bg: "#fb7185" },
  { id: "cyan", name: "青蓝", bg: "#2dd4bf" },
  { id: "green", name: "草绿", bg: "#a3e635" },
];

const PREF_COLOR_KEY = "epub_pref_color";

const getInitialDraft = (n?: NewNote): NewNote => {
  let savedColor = HIGHLIGHT_COLORS[0].bg;

  try {
    savedColor =
      localStorage.getItem(PREF_COLOR_KEY) ||
      HIGHLIGHT_COLORS[0].bg;
  } catch (err) {
    console.warn("读取高亮颜色失败:", err);
  }

  return {
    index: 0,
    cfiRange: "",
    text: "",
    ...n,
    tags: [...(n?.tags || [])],
    color: n?.color || savedColor,
  };
};

export function EpubNotesCreate(props: EpubNotesCreateProps) {
  const [draft, setDraft] = createSignal<NewNote>(
    getInitialDraft(props.newNote)
  );

  const [copied, setCopied] = createSignal(false);
  const [popoverOpened, setPopoverOpened] = createSignal(false);
  const [tagInput, setTagInput] = createSignal("");

  createEffect(() => {
    setDraft(getInitialDraft(props.newNote));
    setTagInput("");
    setPopoverOpened(false);
  });

  const currentColor = () =>
    draft().color || HIGHLIGHT_COLORS[0].bg;

  const selectedColorObj = () =>
    HIGHLIGHT_COLORS.find(
      c => c.bg === currentColor()
    ) || HIGHLIGHT_COLORS[0];

  const handleColorChange = (
    colorBg: string,
    e: MouseEvent
  ) => {
    e.stopPropagation();

    try {
      localStorage.setItem(PREF_COLOR_KEY, colorBg);
    } catch (err) {
      console.warn("保存颜色失败:", err);
    }

    setDraft(prev => ({
      ...prev,
      color: colorBg,
    }));

    setPopoverOpened(false);
  };

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();

    if (!draft().text) return;

    try {
      await navigator.clipboard.writeText(draft().text);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("复制引用失败:", err);
    }
  };

  const addTag = (tagText: string) => {
    const val = tagText.trim();
    if (!val) return false;

    const currentTags = draft().tags || [];

    if (currentTags.includes(val)) {
      return false;
    }

    setDraft(prev => ({
      ...prev,
      tags: [...currentTags, val],
    }));

    return true;
  };

  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (addTag(tagInput())) {
      setTagInput("");
    }
  };

  const handleRemoveTag = (
    tagToRemove: string,
    e: MouseEvent
  ) => {
    e.stopPropagation();

    setDraft(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(
        t => t !== tagToRemove
      ),
    }));
  };

  const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentTagText = tagInput().trim();
    const updatedTags = [...(draft().tags || [])];

    if (
      currentTagText &&
      !updatedTags.includes(currentTagText)
    ) {
      updatedTags.push(currentTagText);
    }

    const finalData: NewNote = {
      ...draft(),
      tags: updatedTags,
      updatedAt: Date.now(),
    };

    console.log("保存笔记:", finalData);

    props.onSave(finalData);
  };

  const handleCancel = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("取消笔记");

    props.onCancel?.();
  };

  return (
    <div class="flex flex-col gap-2.5 box-border bg-transparent p-3 text-stone-900">
      {/* 标题 */}
      <div class="flex items-center justify-center gap-2 border-b border-stone-300/60 pb-2">
        <input
          type="text"
          placeholder="输入笔记标题..."
          value={draft().title || ""}
          onInput={(e) =>
            setDraft(prev => ({
              ...prev,
              title: e.currentTarget.value,
            }))
          }
          class="w-full bg-transparent text-center text-sm font-semibold text-stone-900 placeholder:text-stone-400 border-none outline-none"
        />
      </div>

      {/* 引用内容 */}
      <Show when={draft().text}>
        <div class="relative flex items-center justify-between gap-2 rounded-lg border border-stone-300/70 bg-stone-50/50 px-3 py-1.5">
          <div
            class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
            style={{
              "background-color": currentColor(),
            }}
          />

          <div class="flex min-w-0 flex-1 items-center gap-2 pl-1">
            <IconQuote
              size={13}
              class="shrink-0 text-stone-400"
            />

            <p class="min-w-0 flex-1 truncate whitespace-nowrap text-xs font-medium text-stone-700">
              {draft().text}
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
                  setPopoverOpened(v => !v);
                }}
                class="flex cursor-pointer items-center rounded p-1 hover:bg-stone-200/60"
              >
                <div
                  class="h-3.5 w-3.5 rounded-full border border-stone-400"
                  style={{
                    "background-color": selectedColorObj().bg,
                  }}
                />
              </button>

              <Show when={popoverOpened()}>
                <div
                  class="absolute right-0 top-full z-20 mt-1.5 flex min-w-[150px] flex-col gap-1.5 rounded-xl border border-stone-300 bg-white p-2 shadow-xl"
                >
                  <span class="px-1 text-[10px] font-bold text-stone-500">
                    标记高亮色彩
                  </span>

                  <div class="flex flex-wrap items-center gap-1.5 px-1">
                    <For each={HIGHLIGHT_COLORS}>
                      {(c) => (
                        <button
                          type="button"
                          title={c.name}
                          onClick={(e) =>
                            handleColorChange(c.bg, e)
                          }
                          class="h-4.5 w-4.5 cursor-pointer rounded-full border border-stone-400/80"
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

            {/* 复制 */}
            <button
              type="button"
              title={copied() ? "已复制" : "复制引用"}
              onClick={handleCopy}
              class="cursor-pointer rounded p-1 text-stone-400 hover:text-stone-700"
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

      {/* 标签管理 */}
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-1.5 px-0.5 text-xs text-stone-500">
          <IconTag size={13} />
          <span>标签管理 (输入后按回车添加)</span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <For each={draft().tags || []}>
            {(tag) => (
              <span class="inline-flex items-center gap-1 rounded-md bg-stone-200/70 px-2 py-0.5 text-[11px] text-stone-700">
                {tag}

                <button
                  type="button"
                  onClick={(e) =>
                    handleRemoveTag(tag, e)
                  }
                  class="cursor-pointer hover:text-red-500"
                >
                  <IconX size={12} />
                </button>
              </span>
            )}
          </For>
        </div>

        <input
          type="text"
          placeholder="添加标签（如：灵感、核心、待办）..."
          value={tagInput()}
          onInput={(e) =>
            setTagInput(e.currentTarget.value)
          }
          onKeyDown={handleAddTag}
          class="w-full rounded-md border border-stone-300/70 bg-stone-50/30 px-2.5 py-1.5 text-xs text-stone-800 outline-none focus:border-stone-400"
        />
      </div>

      {/* 操作按钮 */}
      <div class="flex shrink-0 items-center gap-2 pt-2">
        <Show when={props.onCancel}>
          <button
            type="button"
            onClick={handleCancel}
            class="flex-1 cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            取消
          </button>
        </Show>

        <button
          type="button"
          onClick={handleSave}
          class="flex-1 cursor-pointer rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-200"
        >
          保存
        </button>
      </div>
    </div>
  );
}

export default EpubNotesCreate;
