import { type JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
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

  onMount(() => {
    const mq = matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);

    update();
    mq.addEventListener("change", update);
    onCleanup(() => mq.removeEventListener("change", update));
  });

  const toggleNotes = (visible: boolean) => {
    setIsTransitioning(true);
    setNotesVisible(visible);

    setTimeout(() => {
      setIsTransitioning(false);
      dispatchEvent(new Event("resize"));
    }, 300);
  };

  const btn =
    "absolute z-20 flex items-center rounded-full bg-white/80 backdrop-blur-md border border-stone-200/60 shadow-xs transition-all cursor-pointer";

  return (
    <div class="flex w-full justify-center bg-[#fbfbfa] text-stone-800">
      <div
        class="relative flex w-full max-w-7xl overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-xs"
        style={{
          "background-color": props.bg,
          height: props.height ? `${props.height}px` : "100vh",
        }}
      >
        <main
          class={`relative h-full min-w-0 overflow-y-auto transition-all duration-300 ${
            isPortrait() || !notesVisible() ? "w-full" : "w-[70%]"
          }`}
          style={{ "background-color": props.bg }}
        >
          <Show when={isTransitioning()}>
            <div
              class="absolute inset-0 z-40 flex items-center justify-center"
              style={{ "background-color": props.bg || "#fff" }}
            >
              <div class="flex flex-col items-center gap-2">
                <IconLoader2 size={28} class="animate-spin text-stone-400" />
                <span class="text-xs text-stone-500">正在调整排版...</span>
              </div>
            </div>
          </Show>

          <div
            class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: "4cm", height: "4cm" }}
            onDblClick={() => setShowControls(v => !v)}
          />

          {props.epub}

          <Show when={showControls()}>
            <Show when={props.onExit}>
              <button
                onClick={props.onExit}
                class={`${btn} left-3 top-3 gap-1.5 px-3 py-1.5 text-xs`}
              >
                <IconDoorExit size={16} />
                退出
              </button>
            </Show>

            <Show when={props.onPrevPage}>
              <button
                onClick={props.onPrevPage}
                class={`${btn} bottom-3 left-3 px-2.5 py-1 text-[11px]`}
              >
                <IconChevronLeft size={14} />
                上一页
              </button>
            </Show>

            <Show when={props.onNextPage}>
              <button
                onClick={props.onNextPage}
                class={`${btn} bottom-3 right-3 px-2.5 py-1 text-[11px]`}
              >
                下一页
                <IconChevronRight size={14} />
              </button>
            </Show>
          </Show>

          <Show when={!isPortrait() && !notesVisible()}>
            <button
              onClick={() => toggleNotes(true)}
              class="absolute right-8 top-3 z-20 rounded-lg bg-white/80 p-1.5 shadow-xs"
            >
              <IconNotebook size={15} />
            </button>
          </Show>
        </main>

        <Show when={!isPortrait() && notesVisible()}>
          <aside
            class="flex h-full w-[30%] min-w-0 shrink-0 flex-col overflow-hidden border-l border-stone-200/80"
            style={{ "background-color": props.bg }}
          >
            <header class="flex items-center justify-between border-b border-stone-200/80 px-4 py-3.5">
              <span class="flex items-center gap-2 truncate text-sm font-semibold">
                <IconNotebook size={16} />
                {props.notesTitle || "读书笔记"}
              </span>

              <button
                onClick={() => toggleNotes(false)}
                class="flex h-6 w-6 items-center justify-center rounded-full"
              >
                <IconX size={14} />
              </button>
            </header>

            <div class="flex-1 overflow-y-auto overflow-x-hidden p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}