import {
  type JSX,
  type ParentProps,
  splitProps,
  Show,
} from "solid-js";

import {
  IconNotebook,
  IconDoorExit,
} from "@tabler/icons-solidjs";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  bg?: string;
  height?: number;
  controlsEnabled?: boolean;
  notesEnabled?: boolean;
  onExit?: () => void;
  onOpenNotes?: () => void;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "height",
    "controlsEnabled",
    "notesEnabled",
    "onExit",
    "onOpenNotes",
  ]);

  const buttonClass =
    "absolute z-30 flex items-center gap-1.5 " +
    "rounded-lg border border-stone-200/80 " +
    "bg-white/90 px-3 py-1.5 text-xs " +
    "text-stone-700 shadow-md backdrop-blur-md " +
    "cursor-pointer select-none transition-all duration-300 " +
    "hover:bg-white " +
    "dark:border-zinc-700/80 dark:bg-zinc-800/90 " +
    "dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <div
      class="relative isolate w-full overflow-hidden"
      style={{
        height: local.height != null ? `${local.height}px` : "100%",
        "background-color": local.bg,
      }}
    >
      {/* EPUB 挂载容器 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 overflow-y-auto"
        style={{ "background-color": local.bg }}
      >
        {local.children}
      </div>

      {/* 退出按钮（可通过外部状态控制显隐） */}
      <Show when={local.controlsEnabled && local.onExit}>
        <button
          type="button"
          title="退出阅读"
          class={`${buttonClass} left-4 top-4`}
          onClick={() => local.onExit?.()}
        >
          <IconDoorExit size={16} />
          退出
        </button>
      </Show>

      {/* 右上角展开笔记入口 */}
      <Show when={local.notesEnabled && local.onOpenNotes}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          class={`${buttonClass} right-4 top-4 p-2`}
          onClick={() => local.onOpenNotes?.()}
        >
          <IconNotebook size={17} />
        </button>
      </Show>
    </div>
  );
}

export default EpubView;