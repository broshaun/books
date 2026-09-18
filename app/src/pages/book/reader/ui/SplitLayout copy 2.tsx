import {
  type JSX,
  Show,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import {
  IconNotebook,
  IconDoorExit,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconLoader2,
} from "@tabler/icons-solidjs";

export interface SplitLayoutProps {
  epub: JSX.Element;
  notes: JSX.Element;
  bg?: string;
  height?: number;
  notesTitle?: string;
  onExit?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export default function SplitLayout(props: SplitLayoutProps) {
  const [isPortrait, setIsPortrait] = createSignal(false);
  const [showControls, setShowControls] = createSignal(false);
  const [notesVisible, setNotesVisible] = createSignal(true);
  const [isTransitioning, setIsTransitioning] = createSignal(false);

  let transitionTimer: number | undefined;

  onMount(() => {
    const media = window.matchMedia("(orientation: portrait)");

    const updateOrientation = () => {
      setIsPortrait(media.matches);
    };

    updateOrientation();
    media.addEventListener("change", updateOrientation);

    onCleanup(() => {
      media.removeEventListener("change", updateOrientation);

      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
    });
  });

  const toggleNotes = (visible: boolean) => {
    if (notesVisible() === visible) return;

    if (transitionTimer) {
      clearTimeout(transitionTimer);
    }

    setIsTransitioning(true);
    setNotesVisible(visible);

    transitionTimer = window.setTimeout(() => {
      setIsTransitioning(false);
      window.dispatchEvent(new Event("resize"));
      transitionTimer = undefined;
    }, 300);
  };

  const buttonClass =
    "absolute z-20 flex items-center bg-white/80 dark:bg-zinc-800/80 " +
    "backdrop-blur-md border border-stone-200/60 dark:border-zinc-700/60 " +
    "shadow-xs transition-all cursor-pointer animate-fade-in";

  return (
    <div class="flex w-full justify-center bg-[#fbfbfa] text-stone-800">
      <div
        class="relative flex w-full max-w-7xl overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-xs"
        style={{
          "background-color": props.bg,
          height: props.height != null ? `${props.height}px` : "100vh",
        }}
      >
        {/* Reader */}
        <main
          class={`relative h-full min-w-0 overflow-y-auto transition-all duration-300 ${
            isPortrait() || !notesVisible() ? "w-full" : "w-[70%]"
          }`}
          style={{ "background-color": props.bg }}
        >
          {/* Layout transition mask */}
          <Show when={isTransitioning()}>
            <div
              class="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-xs"
              style={{ "background-color": props.bg || "#fff" }}
            >
              <div class="flex flex-col items-center gap-2">
                <IconLoader2
                  size={28}
                  class="animate-spin text-stone-400"
                />
                <span class="text-xs font-medium text-stone-500">
                  正在调整排版...
                </span>
              </div>
            </div>
          </Show>

          {/* Double-click trigger */}
          <div
            class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-default rounded-full"
            style={{
              width: "4cm",
              height: "4cm",
            }}
            onDblClick={() => setShowControls((v) => !v)}
            title="双击中间区域显示/隐藏菜单"
          />

          {props.epub}

          {/* Reader controls */}
          <Show when={showControls()}>
            <Show when={props.onExit}>
              <button
                type="button"
                onClick={props.onExit}
                class={`${buttonClass} group left-3 top-3 gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-white hover:text-stone-900 dark:text-zinc-300`}
                title="退出阅读"
              >
                <IconDoorExit
                  size={16}
                  class="transition-transform group-hover:-translate-x-0.5"
                />
                退出
              </button>
            </Show>

            <Show when={props.onPrevPage}>
              <button
                type="button"
                onClick={props.onPrevPage}
                class={`${buttonClass} bottom-3 left-3 gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:bg-white/90 dark:text-zinc-200`}
                title="上一页"
              >
                <IconChevronLeft size={14} />
                上一页
              </button>
            </Show>

            <Show when={props.onNextPage}>
              <button
                type="button"
                onClick={props.onNextPage}
                class={`${buttonClass} bottom-3 right-3 gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:bg-white/90 dark:text-zinc-200`}
                title="下一页"
              >
                下一页
                <IconChevronRight size={14} />
              </button>
            </Show>
          </Show>

          {/* Show notes */}
          <Show when={!isPortrait() && !notesVisible()}>
            <button
              type="button"
              onClick={() => toggleNotes(true)}
              class="absolute right-8 top-3 z-20 flex cursor-pointer items-center rounded-lg border border-stone-200/70 bg-white/80 p-1.5 text-stone-700 shadow-xs backdrop-blur-md"
              title="展开笔记面板"
            >
              <IconNotebook size={15} class="text-stone-500" />
            </button>
          </Show>
        </main>

        {/* Notes */}
        <Show when={!isPortrait() && notesVisible()}>
          <aside
            class="flex h-full w-[30%] min-w-0 shrink-0 flex-col overflow-hidden border-l border-stone-200/80 bg-stone-50/40"
            style={{ "background-color": props.bg }}
          >
            <header class="flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/60 px-4 py-3.5">
              <span class="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-stone-700">
                <IconNotebook
                  size={16}
                  class="shrink-0 text-stone-400"
                />
                {props.notesTitle ?? "读书笔记"}
              </span>

              <button
                type="button"
                onClick={() => toggleNotes(false)}
                class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
                title="隐藏笔记"
              >
                <IconX size={14} />
              </button>
            </header>

            <div class="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}