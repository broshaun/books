import { IconList, IconSearch, IconEyeOff, IconEye, IconLetterCase, IconTagPlus } from "@tabler/icons-solidjs";
import { createSignal, onMount, onCleanup, createEffect, createResource } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubViews } from "./hook/useEpubViews";
import { useEpubNotes } from "./hook/useEpubNotes";
import { createEpubLoader } from "@/mod/lib/createEpubLoader";
import { useCurrentOperation } from "./hook/useCurrentOperation";

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
import { epubNotesStorage } from "./hook/epubNotesStorage";



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


  const [currentCfi, setCfi] = createSignal<string>();

  const { openBook } = createEpubLoader();
  const [currentBook] = createResource(
    () => props.path,
    async () => {
      const book = await openBook(props.path);
      const bookTitle = book?.packaging?.metadata?.title || "";
      const bookIdentifier = book?.packaging?.metadata?.identifier || "";
      console.log("bookTitle", bookTitle);
      console.log("bookIdentifier", bookIdentifier);
      return book
    });

  const { bookmarks, toggleBookmark, isBookmarked, removeBookmark } = useBookmarks(() => currentBook());

  // 🌟 点击书签按钮时直接调用（传入当前 cfi）
  const handleToggleBookmark = () => {
    const cfi = currentCfi();
    if (cfi) {
      toggleBookmark(cfi); // 自动计算标题、自动存储
    }
  };

  let viewerRef!: HTMLDivElement;
  const [instance, setInstance] = createSignal<any>(null);
  createEffect(() => {
    const bookInstance = currentBook();
    if (!viewerRef || !bookInstance) return;
    const renderInstance = bookInstance.renderTo(viewerRef, {
      flow: "scrolled",
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
    });
    setInstance(renderInstance);
  });

  const { currentSet, opt } = useCurrentOperation<string>([]);
  const [tocOpened, setTocOpened] = createSignal(false);
  const [searchOpened, setSearchOpened] = createSignal(false);
  const [styleOpened, setStyleOpened] = createSignal(false);
  const { hideNotes, toggleNotes } = useEpubViews(instance);
  const { put: newNode, remove, current, currentIndexNodes, filter } = useEpubNotes(instance);
  const [activeNote, setActiveNote] = createSignal<NewNote>();


  createResource(async () => {
    console.log('epubNotesStorage.getNotes', await epubNotesStorage.getNotes())
  })






  const handleJump = (cfiOrHref: string) => {
    instance()?.display(cfiOrHref);
  };


  const handleMouseUp = () => {
    const hasSelection = currentSet().has("select");
    if (!hasSelection) {
      opt("click");
    }
  };

  const handleMarkClicked = (cfiRange: string) => {
    opt("mark");
    console.log('选中文字', cfiRange)
  };

  const handleSelected = (cfiRange: string, contents: any) => {
    const index = contents?.sectionIndex;
    const text = instance()?.getRange(cfiRange)?.toString() || "";
    if (!text.trim()) return;
    opt("select");
    const newNoteItem: NewNote = {
      book: props.path,
      index: index,
      cfiRange: cfiRange,
      text: text.trim(),
      updatedAt: Date.now(),
    };
    setActiveNote(newNoteItem);
  };

  const handleFontSizeChange = (size: number) => {
    const inst = instance();
    if (inst) {
      inst.themes.fontSize(`${size}px`);
    }
    useStore2.setFontSize(size, inst);
  };

  let debounceTimer: number | NodeJS.Timeout;
  const handleRelocated = (location: any) => {
    const cfi = location?.start?.cfi;
    if (!cfi) return;
    setCfi(cfi)
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      localStorage.setItem("READ_POSITION_KEY", cfi);
    }, 3000);
  };
  onCleanup(() => {
    clearTimeout(debounceTimer);
  });


  const handleJumpCfiRange = async (cfiRange: string) => {
    const inst = instance();
    if (!inst) return;
    return await inst.display(cfiRange);
  };

  let hasInitialized = false;
  createEffect(() => {
    const inst = instance();
    if (!inst || hasInitialized) return;

    const contentHandler = (contents: any) => {
      const doc = contents.document;
      doc.addEventListener("mouseup", handleMouseUp);
    };

    inst.hooks.content.register(contentHandler);
    inst.on("markClicked", handleMarkClicked);
    inst.on("selected", handleSelected);
    inst.on("relocated", handleRelocated);
    hasInitialized = true;
    onCleanup(() => {
      hasInitialized = false;
      inst.destroy();
    });
  });


  onMount(() => {
    const inst = instance();
    if (!inst) return;
    const savedFontSize = useStore2.fontSize;
    if (savedFontSize) {
      inst.themes.fontSize(`${savedFontSize}px`);
    }
    const savedCfi = localStorage.getItem("READ_POSITION_KEY");
    inst.display(savedCfi || undefined);
  })

  let highlightTimer: number | undefined;
  const HIGHLIGHT_DURATION = 3000;
  const handleSelectResult = (cfi: string, keyword: string) => {
    handleJump(cfi);
    console.log("keyword:", keyword);
    const inst = instance();
    if (!inst || !cfi) return;
    try { inst.annotations.add("highlight", cfi, {}, () => { }, "search-highlight-class", { fill: "#fef08a", "fill-opacity": "0.5" }); }
    catch (err) { console.error("添加高亮失败:", err); }
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(() => {
      try { inst.annotations.remove(cfi, "highlight"); }
      catch (e) { }
    }, HIGHLIGHT_DURATION);
  };



  return (
    <Box height={height()}>
      <SplitLayout bg={backgroundColor()} height={height()}
        onExit={() => { navigate({ to: "/book/shelf" }) }}
        onPrevPage={() => instance()?.prev()}
        onNextPage={() => instance()?.next()}
        epub={
          <EpubPaper ref={viewerRef} />
        }
        notesTitle={'笔记'}
        notes={
          currentSet().has("select") ? (
            <EpubNotesCreate newNote={activeNote()} onSave={(v) => { newNode(v); opt("mark"); }} onCancel={() => { opt("click"); console.log('取消笔记') }} />
          ) : currentSet().has("mark") ? (
            <EpubNotesEdit notes={current()} onNoteChange={(v) => { newNode(v); }} onDelete={(cfiRange) => { remove(cfiRange); }} />
          ) : currentSet().has("click") ? (
            <EpubNotesTimeline
              notes={currentIndexNodes()}
              onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }}
              onDelete={(cfiRange) => { remove(cfiRange); }}
              onSelectTag={(tag) => { console.log("tag", tag); filter({ tag: tag }) }}
            />
          ) : (
            <BookInfoPanel book={currentBook()} />
          )
        }
      />

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
        onSelectResult={handleSelectResult}
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

        <button type="button" onClick={handleToggleBookmark}
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
    </Box>
  )
}

export default Reader;