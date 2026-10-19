import { IconList, IconSearch, IconEyeOff, IconEye, IconLetterCase, IconTagPlus, IconDoorExit, IconChevronLeft,IconChevronRight } from "@tabler/icons-solidjs";
import { createSignal, onCleanup, createEffect, on, Show, Switch, Match, createMemo } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubViews } from "./hook/useEpubViews";
import { useEpubNotes } from "./hook/useEpubNotes";
import { useIntentBuffer } from "@/hooks/useIntentBuffer";
import { useBookMeta } from "./hook/useBookMeta";
import { EpubSearchDrawer } from "./ui/EpubSearchDrawer";
import { EpubTocDrawer } from "./ui/EpubTocDrawer";
import { EpubStyleDrawer } from "./ui/EpubStyleDrawer";
import { QuickActionMenu } from "./ui/QuickActionMenu";
import { useBookmarks } from "./hook/useBookmarks";
import { useEpubNotesSync } from "./hook/useEpubNotesSync";
import { notesCache } from "@/api/cache/notesCache";
import { EpubView } from "./ui/EpubView";
import { BookInfoPanel } from "./ui/BookInfoPanel";
import { EpubDrawer } from "./ui/EpubDrawer";
import { EpubNotesCreate } from "./ui/EpubNotesCreate";
import { EpubNotesEdit } from "./ui/EpubNotesEdit";
import { EpubNotesTimeline } from "./ui/EpubNotesTimeline";
import { type Rendition } from "epubjs";
import { FloatingButton } from "@/components/FloatingButton";
import { onMount } from "solid-js";


const savePositionDebounced = debounce((cfi: string) => {
  localStorage.setItem("READ_POSITION_KEY", cfi);
}, 3000);

const removeHighlightDebounced = debounce((inst: Rendition, cfi: string) => {
  inst.annotations.remove(cfi, "highlight");
}, 3000);

interface ReaderProps {
  path: string;
}

interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  updatedAt?: number;
}

export function Reader(props: ReaderProps) {
  let viewerRef!: HTMLDivElement;


  const navigate = useNavigate();
  const height = () => useStore2.height;
  const width = () => useStore2.width;
  const backgroundColor = () => useStore2.backgroundColor;
  const setBackgroundColor = useStore2.setBackgroundColor;

  const [currentCfi, setCfi] = createSignal<string>();
  const [activeNote, setActiveNote] = createSignal<NewNote>();
  const [notesOpened, setNotesOpened] = createSignal(false);
  const [isPinned, setIsPinned] = createSignal(false);
  const [tag, setTag] = createSignal<string | null>(null);
  const [instance, setInstance] = createSignal<any>(null);
  const [markCfiRange, setMarkCfiRange] = createSignal<string | null>(null);
  const [index, setIndex] = createSignal<number>(0);
  const [tocOpened, setTocOpened] = createSignal(false);
  const [searchOpened, setSearchOpened] = createSignal(false);
  const [styleOpened, setStyleOpened] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [floatingShow, setFloatingShow] = createSignal(true);

  const { book: currentBook, meta: bookMata } = useBookMeta(() => props.path);
  const { put, del, filter, get, getTags } = useEpubNotes(() => instance());
  const { bookmarks, toggleBookmark, isBookmarked, removeBookmark } = useBookmarks(() => currentBook());
  const { hideNotes, toggleNotes } = useEpubViews(instance);

  const { current, push } = useIntentBuffer({
    waitMs: 200, // 开启 200ms 缓冲窗口，完美聚合同步触发的触控事件
    resolve: (document) => {
      console.log("document实时内容:", document);

      // 返回笔记列表
      if (document.has("Notes")) {
        return "TIMELINE";
      }

      // 点击高亮笔记
      if (document.has("Mark")) {
        setNotesOpened(true);
        return "EDIT_NOTE";
      }

      // 快速点击
      if (document.has("PointerDown") && document.has("PointerUp")) {
        const downTime = document.get("PointerDown")!.time;
        const upTime = document.get("PointerUp")!.time;
        const duration = upTime - downTime;
        if (duration <= 300) {
          const PointerDownX = document.get("PointerDown")!.x
          const PointerDownY = document.get("PointerDown")!.y
          const PointerUpX = document.get("PointerUp")!.x
          const PointerUpY = document.get("PointerUp")!.y
          if (PointerDownX === PointerUpX && PointerDownY === PointerUpY) {
            setFloatingShow(p => !p)
            return "TIMELINE";
          }
        }
      }

      // 选择文字，同时包含 "Select" 和 "PointerUp"
      if (document.has("Select")) {
        if (document.has("PointerUp")) {
          setNotesOpened(true);
          return "CREATE_NOTE";
        }
        return
      }

    }
  });


  const viewerWidth = createMemo(() => { return isPinned() ? "65%" : "100%" });


  createEffect(() => {
    console.log('current', current())
  })


  useEpubNotesSync({
    interval: 3000,
    onSyncSet: async (localNotes) => {
      await notesCache.set(localNotes);
    },
  });

  onMount(() => {
    // viewerRef.addEventListener("pointerdown", handlePointerDown);
    // viewerRef.addEventListener("pointerup", handlePointerUp);

    let lastWidth = 0;
    let lastHeight = 0;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const inst = instance();
      if (!inst) return;

      const { width, height } = entry.contentRect;
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);

      if (roundedWidth <= 0 || roundedHeight <= 0) return;

      // 只有当尺寸真正发生变化时才调用 resize，防止死循环卡死
      if (roundedWidth !== lastWidth || roundedHeight !== lastHeight) {
        lastWidth = roundedWidth;
        lastHeight = roundedHeight;

        // 稍微延后或者直接安全调用
        requestAnimationFrame(() => {
          inst.resize(roundedWidth, roundedHeight);
        });
      }
    });

    observer.observe(viewerRef);

    onCleanup(() => {
      // viewerRef.removeEventListener("pointerdown", handlePointerDown);
      // viewerRef.removeEventListener("pointerup", handlePointerUp);
      observer.disconnect();
    });
  });


  createEffect(() => {
    const bookInstance = currentBook();
    if (!viewerRef || !bookInstance) return;
    // 1. 创建渲染实例
    const ints = bookInstance.renderTo(viewerRef, {
      flow: "scrolled",
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
    });
    setInstance(ints);
    // 3. 立即绑定所有事件和钩子
    ints.on("markClicked", handleMarkClicked);
    ints.on("selected", handleSelected);
    ints.on("relocated", handleRelocated);
    ints.on("click", handleClick);

    // 仅注入防止 iOS 文本大小自动调整的样式，保持原汁原味
    ints.hooks.content.register((contents: any) => {
      const doc = contents.document;
      if (doc) {
        doc.addEventListener("pointerdown", handlePointerDown);
        doc.addEventListener("pointerup", handlePointerUp);
        const styleEl = doc.createElement("style");
        styleEl.innerHTML = `* {
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
          }`;
        doc.head.appendChild(styleEl);
      }
    });

    // 4. 设置初始样式与恢复阅读进度
    const savedFontSize = useStore2.fontSize;
    if (savedFontSize) {
      ints.themes.fontSize(`${savedFontSize}px`);
    }

    const savedCfi = localStorage.getItem("READ_POSITION_KEY");
    (async () => {
      try {
        setIsLoading(true);
        await ints.display(savedCfi || undefined);
      } catch (error) {
        console.warn("恢复进度失败，打开首页", error);
        await ints.display();
      } finally {
        setIsLoading(false);
      }
    })();

    // 5. 统一管理销毁清理
    onCleanup(() => {
      ints.destroy();
    });
  });


  // 处理正文点击事件
  function handleClick(e: any) {
    // console.log("点击事件：", e);
  }

  // 全局鼠标/触控按下处理
  function handlePointerDown(e: PointerEvent) {
    push('PointerDown', { 'x': e.offsetX, "y": e.offsetX })
  }

  // 全局鼠标/触控抬起处理
  function handlePointerUp(e: PointerEvent) {
    push('PointerUp', { 'x': e.offsetX, "y": e.offsetX })
  }

  // 选择高亮笔记
  function handleMarkClicked(cfiRange: string) {
    push("Mark");
    setMarkCfiRange(cfiRange);
  };

  // 选择文字并触发新建笔记弹窗
  function handleSelected(cfiRange: string, contents: any) {
    const index = contents?.sectionIndex;
    const text = instance()?.getRange(cfiRange)?.toString() || "";
    if (!text.trim()) return;
    push("Select");
    const newNoteItem: NewNote = {
      book: props.path,
      index: index,
      cfiRange: cfiRange,
      text: text.trim(),
      updatedAt: Date.now(),
    };
    setActiveNote(newNoteItem);
  };

  // 实时同步读书位置与防抖存储进度
  function handleRelocated(location: any) {
    const cfi = location?.start?.cfi;
    if (!cfi) return;
    setCfi(cfi);
    savePositionDebounced(cfi);
    const newIndex = location?.start?.index;
    if (newIndex !== 0) {
      setIndex(newIndex);
    }
  };

  // 切换当前阅读位置的书签状态
  function handleToggleBookmark() {
    const cfi = currentCfi();
    if (cfi) {
      toggleBookmark(cfi);
    }
  };

  // 跳转到指定的章节链接或 CFI 位置
  async function handleJump(cfiOrHref: string) {
    const inst = instance();
    if (!inst) return;
    try {
      setIsLoading(true);
      await inst.display(cfiOrHref);
    } catch (error) {
      console.error("跳转失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改阅读器正文字体大小（回归旧版，只保留 themes.fontSize）
  function handleFontSizeChange(size: number) {
    const inst = instance();
    if (!inst) return;
    try {
      const sizeStr = typeof size === "number" ? `${size}px` : size;
      inst.themes.fontSize(sizeStr);
      useStore2.setFontSize(size);
    } catch (e) {
      console.error("设置字体大小失败:", e);
    }
  };

  // 跳转到指定的 CFI 范围
  function handleJumpCfiRange(cfiRange: string) {
    const inst = instance();
    if (!inst) return;
    inst.display(cfiRange);
  };

  // 处理搜索结果选中并高亮显示
  function handleSearchResult(cfi: string, keyword: string) {
    handleJump(cfi);
    const inst = instance();
    if (!inst || !cfi) return;
    try {
      inst.annotations.add("highlight", cfi, {}, () => { }, "search-highlight-class", { fill: "#fef08a", "fill-opacity": "0.5" });
      removeHighlightDebounced(inst, cfi);
    } catch (err) {
      console.error("添加高亮失败:", err);
    }
  }


  return (
    <div class="relative h-dvh w-full min-h-0 min-w-0 overflow-hidden">

      <EpubView
        loading={isLoading()}
        ref={viewerRef}
        bg={backgroundColor()}
        height="100%"
        width={viewerWidth()}
      >

        <FloatingButton
          show={floatingShow()}
          initialX={16}
          initialY={16}
          icon={<IconDoorExit size={16} />}
          iconPosition="left"
          label="退出"
          onClick={() => navigate({ to: "/mobile/shelf/" })}
        />

        <FloatingButton
          show={floatingShow()}
          initialX={16}
          initialY={- 16}
          icon={<IconChevronLeft size={16} />}
          iconPosition="left"
          label="上一页"
          onClick={() => instance().prev()}
        />

        <FloatingButton
          show={floatingShow()}
          initialX={- 16}
          initialY={- 16}
          icon={<IconChevronRight size={16} />}
          iconPosition="right"
          label="下一页"
          onClick={() => instance().next()}
        />

      </EpubView>



      <EpubDrawer
        width={"35%"}
        open={notesOpened()}
        onOpenChange={(opend) => { setNotesOpened(opend) }}
        bg={backgroundColor()}
        pinned={isPinned()}
        onPinChange={setIsPinned}
        onTitleClick={() => { push('Notes') }}
      >
        <Switch fallback={<BookInfoPanel meta={bookMata()} /> }>

          <Match when={current() == "CREATE_NOTE"}>
            <EpubNotesCreate
              newNote={activeNote()}
              onSave={(v) => { put(v); push("Mark"); }}
              onCancel={() => { push("Notes"); }}
            />
          </Match>

          <Match when={current() == "EDIT_NOTE"}>
            <EpubNotesEdit
              notes={get(markCfiRange())}
              onNoteChange={(v) => { put(v); }}
              // onDelete={(cfiRange) => { del(cfiRange); push("Notes"); }}
            />
          </Match>

          <Match when={current() == "TIMELINE"}>
            <EpubNotesTimeline
              tags={getTags({ index: index() })}
              notes={filter({ index: index(), tags: tag() })}
              onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }}
              onDelete={(cfiRange) => { del(cfiRange); }}
              onSelectTag={(tag) => { setTag(tag); }}
              onContentClick={(cfiRange) => { handleMarkClicked(cfiRange); }}
            />
          </Match>
        </Switch>
      </EpubDrawer>


      <EpubTocDrawer
        opened={tocOpened()}
        onClose={() => setTocOpened(false)}
        book={currentBook()}
        onSelectChapter={(href) => { handleJump(href); }}
        bookmarks={bookmarks}
        onRemoveBookmark={removeBookmark}
      />

      <EpubSearchDrawer
        opened={searchOpened()}
        onClose={() => setSearchOpened(false)}
        book={currentBook()}
        onSelectResult={handleSearchResult}
      />

      <EpubStyleDrawer
        opened={styleOpened()}
        onClose={() => setStyleOpened(false)}
        onFontSizeChange={handleFontSizeChange}
        onBackgroundColorChange={setBackgroundColor}
      />

      <QuickActionMenu position={{ bottom: 30, right: 30 }} direction='left'>
        <button type="button" onClick={() => setTocOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer">
          <IconList size={20} />
        </button>

        <button
          type="button"
          onClick={handleToggleBookmark}
          class={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${isBookmarked(currentCfi()) ? "text-blue-500" : "text-slate-500"}`}
          title={isBookmarked(currentCfi()) ? "移除当前书签" : "添加当前书签"}
        >
          <IconTagPlus size={20} />
        </button>

        <button type="button" onClick={() => setSearchOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer">
          <IconSearch size={20} />
        </button>

        <button type="button" onClick={() => setStyleOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer">
          <IconLetterCase size={20} />
        </button>

        <button type="button" onClick={toggleNotes} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer">
          {hideNotes() ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </QuickActionMenu>
    </div>
  );
}

export default Reader;