import { IconList, IconSearch, IconEyeOff, IconEye, IconLetterCase, IconTagPlus } from "@tabler/icons-solidjs";
import { createSignal, onMount, on, onCleanup, createEffect, createResource, Switch, Match } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubViews } from "./hook/useEpubViews";
import { useEpubNotes } from "./hook/useEpubNotes";
import { useCaptured } from "./hook/useCaptured";

import { EpubSearchDrawer } from "./ui/EpubSearchDrawer";
import { EpubTocDrawer } from "./ui/EpubTocDrawer";
import { EpubStyleDrawer } from "./ui/EpubStyleDrawer";
import { QuickActionMenu } from "./ui/QuickActionMenu";
import { EpubNotesEdit } from "./ui/EpubNotesEdit";
import { EpubNotesCreate } from "./ui/EpubNotesCreate";
import EpubNotesTimeline from "./ui/EpubNotesTimeline";
import EpubPaper from "./ui/EpubPaper";
import Box from "@/components/Box";
import SplitLayout from "./ui/SplitLayout";
import BookInfoPanel from "./ui/BookInfoPanel";
import { useBookmarks } from "./hook/useBookmarks";
import { useEpubNotesSync } from "./hook/useEpubNotesSync";
import { notesCache } from "@/api/cache/notesCache";
import { debounce } from "@solid-primitives/scheduled";
import { type Rendition } from "epubjs"
import { useBookMeta } from "./hook/useBookMeta";


const savePositionDebounced = debounce((cfi: string) => {
  localStorage.setItem("READ_POSITION_KEY", cfi);
}, 3000);


const removeHighlightDebounced = debounce((inst: Rendition, cfi: string) => {
  inst.annotations.remove(cfi, "highlight");
}, 3000);

interface ReaderProps {
  path: string;
}

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  updatedAt?: number;
}

export function Reader(props: ReaderProps) {
  const navigate = useNavigate();
  const height = () => useStore2.height;
  const backgroundColor = () => useStore2.backgroundColor;
  const setBackgroundColor = useStore2.setBackgroundColor;

  const [currentCfi, setCfi] = createSignal<string>(); // 当前位置

  // const { openBook } = useEpubLoader();

  const { bookmarks, toggleBookmark, isBookmarked, removeBookmark } = useBookmarks(() => currentBook());

  function handleToggleBookmark() {
    const cfi = currentCfi();
    if (cfi) {
      toggleBookmark(cfi);
    }
  };

  let viewerRef!: HTMLDivElement;
  const [instance, setInstance] = createSignal<any>(null);
  createEffect(() => {
    const bookInstance = currentBook();
    console.log('bookInstance', bookInstance)
    if (!viewerRef || !bookInstance) return;
    const renderInstance = bookInstance.renderTo(viewerRef, {
      flow: "scrolled",
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
    });
    setInstance(renderInstance);
  });

  // 获取图书元数据、底部 book 实例以及自动计算好的 bookId
  const { book: currentBook,meta:bookMeta } = useBookMeta(() => props.path);
  const { put, del, filter, get, getTags } = useEpubNotes(() => instance());

  const [tag, setTag] = createSignal<string | null>(null)

  
  const [tocOpened, setTocOpened] = createSignal(false);
  const [searchOpened, setSearchOpened] = createSignal(false);
  const [styleOpened, setStyleOpened] = createSignal(false);
  const { hideNotes, toggleNotes } = useEpubViews(instance);
  const [activeNote, setActiveNote] = createSignal<NewNote>();
  const { capturedSet, capture } = useCaptured<string>([]);



  useEpubNotesSync({
    interval: 3000,
    onSyncSet: async (localNotes) => {
      console.log('同步数据localNotes', localNotes);
      await notesCache.set(localNotes);
    },
  });

  function handleJump(cfiOrHref: string) {
    instance()?.display(cfiOrHref);
  };

  function handleMouseUp() {
    const hasSelection = capturedSet().has("select");
    if (!hasSelection) {
      capture("click");
    }
  };


  const [markCfiRange, setMarkCfiRange] = createSignal<string | null>(null);
  function handleMarkClicked(cfiRange: string) {
    capture("mark");
    console.log('选中文字', cfiRange);
    setMarkCfiRange(cfiRange)
  };

  function handleSelected(cfiRange: string, contents: any) {
    const index = contents?.sectionIndex;
    const text = instance()?.getRange(cfiRange)?.toString() || "";
    if (!text.trim()) return;
    capture("select");
    const newNoteItem: NewNote = {
      book: props.path,
      index: index,
      cfiRange: cfiRange,
      text: text.trim(),
      updatedAt: Date.now(),
    };
    setActiveNote(newNoteItem);
  };

  function handleFontSizeChange(size: number) {
    const inst = instance();
    if (!inst) return;
    try {
      const sizeStr = typeof size === "number" ? `${size}px` : size;
      inst.themes.fontSize(sizeStr);
      useStore2.setFontSize(size, inst);
    } catch (e) {
      console.error("设置字体大小失败:", e);
    }
  };




  const [index, setIndex] = createSignal<number>(0);
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


  async function handleJumpCfiRange(cfiRange: string) {
    const inst = instance();
    if (!inst) return;
    return await inst.display(cfiRange);
  };


  function handleSearchResult(cfi: string, keyword: string) {
    handleJump(cfi);
    console.log("keyword:", keyword);
    const inst = instance();
    if (!inst || !cfi) return;
    try {
      inst.annotations.add("highlight", cfi, {}, () => { }, "search-highlight-class", { fill: "#fef08a", "fill-opacity": "0.5" });
      removeHighlightDebounced(inst, cfi);
    } catch (err) {
      console.error("添加高亮失败:", err);
    }
  }




  createEffect(
    on(
      () => instance(),
      async (inst) => {
        console.log('inst', inst)
        // 1. 如果没有实例，直接返回
        if (!inst) return;
        // 2. 定义事件处理函数
        const contentHandler = (contents: any) => {
          const doc = contents.document;
          doc.addEventListener("mouseup", handleMouseUp);
        };

        // 3. 注册钩子和事件监听
        inst.hooks.content.register(contentHandler);
        inst.on("markClicked", handleMarkClicked);
        inst.on("selected", handleSelected);
        inst.on("relocated", handleRelocated);


        // 4. 应用初始配置
        const savedFontSize = useStore2.fontSize;
        if (savedFontSize) {
          inst.themes.fontSize(`${savedFontSize}px`);
        }

        const savedCfi = localStorage.getItem("READ_POSITION_KEY");

        try {
          await inst.display(savedCfi || undefined);
        } catch (error) {
          console.warn("恢复进度失败，打开首页", error);
          await inst.display();
        }
        onCleanup(() => {
          inst.destroy();
        });
      },

    )
  );






  return (
    <Box height={height()}>
      <SplitLayout
        bg={backgroundColor()}
        height={height()}
        onExit={() => { navigate({ to: "/desktop/shelf/" }); console.log('退出') }}
        onPrevPage={() => { instance()?.prev(); console.log('上一页') }}
        onNextPage={() => { instance()?.next(); console.log('下一页') }}
        epub={<EpubPaper ref={viewerRef} />}
        notesTitle={'笔记'}
        notes={
          <Switch fallback={<BookInfoPanel meta={bookMeta()} />}>

            <Match when={capturedSet().has("select")}>
              <EpubNotesCreate newNote={activeNote()} onSave={(v) => { put(v); capture("mark") }} onCancel={() => { capture("click"); }} />
            </Match>

            <Match when={capturedSet().has("mark")}>
              <EpubNotesEdit notes={get(markCfiRange())} onBack={()=>{capture("click")}} onNoteChange={(v) => { put(v); }} onDelete={(cfiRange) => { del(cfiRange); }} />
            </Match>

            <Match when={capturedSet().has("click")}>
              <EpubNotesTimeline
                isSyncing={false}
                tags={getTags({ index: index() })}
                notes={filter({ index: index(), tags: tag() })}
                onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }}
                onDelete={(cfiRange) => { del(cfiRange); }}
                onSelectTag={(tag) => { setTag(tag) }}
                onContentClick={(cfiRange) => { handleMarkClicked(cfiRange); }}
              />
            </Match>

          </Switch>
        }
      />

      < EpubTocDrawer
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

      <QuickActionMenu>
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
    </Box >
  );
}

export default Reader;