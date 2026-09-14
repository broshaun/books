import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubViews } from "./hook/useEpubViews";
import { useEpubResize } from "./hook/useEpubResize";
import { useEpubNotes } from "./hook/useEpubNotes";
import { useCurrentOperation } from "./hook/useCurrentOperation";

import { EpubSearchDrawer } from "./ui/EpubSearchDrawer";
import { EpubTocDrawer } from "./ui/EpubTocDrawer";
import { EpubStyleDrawer } from "./ui/EpubStyleDrawer";
import { QuickActionMenu } from "./ui/QuickActionMenu";
import { ReaderWorkspace } from "./ui/ReaderWorkspace";
import { EpubNotesEdit } from "./ui/EpubNotesEdit";
import { EpubNotesCreate } from "./ui/EpubNotesCreate";
import EpubNotesTimeline from "./ui/EpubNotesTimeline";
import { createEpubLoader } from "@/mod/lib/createEpubLoader";
import { IconList, IconSearch, IconArrowLeft, IconEyeOff, IconEye, IconTypography, IconNotebook, IconTabs } from "@tabler/icons-react";

interface ReaderProps {
  bookId: string;
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

  const { openBook } = createEpubLoader();
  let viewerRef!: HTMLDivElement;

  const [book, setBook] = createSignal<any>(null);
  const [instance, setInstance] = createSignal<any>(null);

  onMount(async () => {
    try {
      const loadedBook = await openBook(props.bookId);
      setBook(loadedBook);
      const bookTitle = loadedBook?.packaging?.metadata?.title || "";
      const bookIdentifier = loadedBook?.packaging?.metadata?.identifier || "";
      console.log("bookTitle", bookTitle);
      console.log("bookIdentifier", bookIdentifier);
    } catch (e) {
      console.error(e);
    }
  });

  createEffect(() => {
    const currentBook = book();
    if (!viewerRef || !currentBook) return;
    const renderInstance = currentBook.renderTo(viewerRef, {
      flow: "scrolled",
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
    });
    setInstance(renderInstance);
  });

  const { currentSet, opt } = useCurrentOperation<string>([], { interval: 100 });

  const [menuOpened, setMenuOpened] = createSignal(false);
  const [tocOpened, setTocOpened] = createSignal(false);
  const [searchOpened, setSearchOpened] = createSignal(false);
  const [styleOpened, setStyleOpened] = createSignal(false);

  const { hideNotes, toggleNotes } = useEpubViews(instance());
  const { put: newNode, remove, current, currentIndexNodes } = useEpubNotes(instance, props.bookId);

  const [activeNote, setActiveNote] = createSignal<NewNote>();
  const [showNote, setShowNotes] = createSignal(false);
  const triggerResize = useEpubResize(() => viewerRef, instance);

  const handleJump = (cfiOrHref: string) => {
    instance()?.display(cfiOrHref);
    setMenuOpened(false);
  };

  const handleClick = (click: string) => {
    if (click === "mouseup" && currentSet().has("select")) {
      opt("select");
    } else if (click === "mousedown" && currentSet().has("mark")) {
      opt("mark");
    } else {
      opt("click");
    }
    setStyleOpened(false);
    setMenuOpened(false);
  };

  const handleMarkClicked = (cfiRange: string) => {
    opt("mark");
    setShowNotes(true);
  };

  const handleSelected = (cfiRange: string, contents: any) => {
    const index = contents?.sectionIndex;
    const text = instance()?.getRange(cfiRange)?.toString() || "";
    if (!text.trim()) return;
    opt("select");
    setShowNotes(true);
    const newNoteItem: NewNote = {
      book: props.bookId,
      index: index,
      cfiRange: cfiRange,
      text: text.trim(),
      updatedAt: Date.now(),
    };
    setActiveNote(newNoteItem);
    setShowNotes(true);
  };

  const handleFontSizeChange = (size: number) => {
    const inst = instance();
    if (inst) {
      inst.themes.fontSize(`${size}px`);
    }
  };

  const handleRelocated = (location: any) => {
    const cfi = location?.start?.cfi;
    if (cfi) localStorage.setItem("READ_POSITION_KEY", cfi);
  };

  const handleJumpCfiRange = async (cfiRange: string) => {
    const inst = instance();
    if (!inst) return;
    return await inst.display(cfiRange);
  };

  createEffect(() => {
    const inst = instance();
    if (!inst) return;

    const contentHandler = (contents: any) => {
      const doc = contents.document;
      doc.addEventListener("mousedown", () => handleClick("mousedown"));
      doc.addEventListener("mouseup", () => handleClick("mouseup"));
    };

    inst.hooks.content.register(contentHandler);
    inst.on("markClicked", handleMarkClicked);
    inst.on("selected", handleSelected);
    inst.on("relocated", handleRelocated);
    
    const savedCfi = localStorage.getItem("READ_POSITION_KEY");
    inst.display(savedCfi || undefined);

    onCleanup(() => {
      inst.destroy();
    });
  });

  return (
    <div class="relative">
      <ReaderWorkspace showNote={showNote()} height={height()}>
        <ReaderWorkspace.Epub>
          <div
            ref={viewerRef}
            class="h-full w-full"
            style={{ "background-color": backgroundColor() }}
          />
        </ReaderWorkspace.Epub>
        <ReaderWorkspace.Notes>
          {currentSet().has("select") ? (
            <EpubNotesCreate newNote={activeNote()} onSave={(v) => { newNode(v); opt("mark"); }} />
          ) : currentSet().has("mark") ? (
            <EpubNotesEdit notes={current()} onNoteChange={(v) => { newNode(v); }} onDelete={(cfiRange) => { remove(cfiRange); }} />
          ) : currentSet().has("click") ? (
            <EpubNotesTimeline notes={currentIndexNodes()} onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }} />
          ) : (
            <div>无内容</div>
          )}
        </ReaderWorkspace.Notes>
      </ReaderWorkspace>

      {/* 顶部菜单 Drawer */}
      {menuOpened() && (
        <div class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-2 shadow-md">
          <div class="flex items-center justify-between max-w-7xl mx-auto">
            <button type="button" onClick={() => navigate({ to: "/book/shelf" })} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
              <IconArrowLeft size={20} />
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onClick={() => setSearchOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
                <IconSearch size={20} />
              </button>
              <button type="button" onClick={() => setStyleOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
                <IconTypography size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <EpubTocDrawer
        opened={tocOpened()}
        onClose={() => setTocOpened(false)}
        book={book()}
        onSelectChapter={(href) => { handleJump(href); }}
      />

      <EpubSearchDrawer
        opened={searchOpened()}
        onClose={() => setSearchOpened(false)}
        book={book()}
        onSelectResult={(cfi) => handleJump(cfi)}
      />

      <EpubStyleDrawer
        opened={styleOpened()}
        onClose={() => setStyleOpened(false)}
        onFontSizeChange={handleFontSizeChange}
        onBackgroundColorChange={setBackgroundColor}
      />

      <QuickActionMenu>
        <button type="button" onClick={() => setMenuOpened((prev) => !prev)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconTabs size={20} />
        </button>

        <button type="button" onClick={() => setTocOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconList size={20} />
        </button>

        <button type="button" onClick={() => { setShowNotes((prev) => !prev); triggerResize(); }} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconNotebook size={20} />
        </button>

        <button type="button" onClick={toggleNotes} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          {hideNotes() ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </QuickActionMenu>
    </div>
  );
}

export default Reader;