import { IconList, IconSearch, IconArrowLeft, IconEyeOff, IconEye, IconTypography, IconNotebook, IconLetterCase } from "@tabler/icons-solidjs";
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
  const [currentBook] = createResource(
    () => props.bookId,
    async () => {
      const book = await openBook(props.bookId);
      const bookTitle = book?.packaging?.metadata?.title || "";
      const bookIdentifier = book?.packaging?.metadata?.identifier || "";
      console.log("bookTitle", bookTitle);
      console.log("bookIdentifier", bookIdentifier);
      return book
    });

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

  const { currentSet, opt, clear } = useCurrentOperation<string>([], { interval: 100 });
  const [tocOpened, setTocOpened] = createSignal(false);
  const [searchOpened, setSearchOpened] = createSignal(false);
  const [styleOpened, setStyleOpened] = createSignal(false);
  const { hideNotes, toggleNotes } = useEpubViews(instance);
  const { put: newNode, remove, current, currentIndexNodes } = useEpubNotes(instance, props.bookId);
  const [activeNote, setActiveNote] = createSignal<NewNote>();



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
      book: props.bookId,
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
      // doc.addEventListener("mousedown", () => handleClick("mousedown"));
      doc.addEventListener("mouseup", handleMouseUp);
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


  // 在 Reader 组件内部加入这段代码
  createEffect(() => {
    console.log("currentSet 当前按键实时变化:", currentSet());
  });


  return (

    <Box height={height()}>
      <SplitLayout bg={backgroundColor()} height={height()}
        onExit={() => { console.log('退出++'); navigate({ to: "/book/shelf" }) }}
        epub={
          <EpubPaper ref={viewerRef} />
        }
        notes={
          currentSet().has("select") ? (
            <EpubNotesCreate newNote={activeNote()} onSave={(v) => { newNode(v); opt("mark"); }} onCancel={() => clear()} />
          ) : currentSet().has("mark") ? (
            <EpubNotesEdit notes={current()} onNoteChange={(v) => { newNode(v); }} onDelete={(cfiRange) => { remove(cfiRange); }} />
          ) : currentSet().has("click") ? (
            <EpubNotesTimeline notes={currentIndexNodes()} onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }} onDelete={(cfiRange) => { remove(cfiRange); }} />
          ) : (
            <EpubNotesTimeline notes={currentIndexNodes()} onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }} onDelete={(cfiRange) => { remove(cfiRange); }} />
          )
        }

      />

      <EpubTocDrawer
        opened={tocOpened()}
        onClose={() => setTocOpened(false)}
        book={currentBook()}
        onSelectChapter={(href) => { handleJump(href); }}
      />

      <EpubSearchDrawer
        opened={searchOpened()}
        onClose={() => setSearchOpened(false)}
        book={currentBook()}
        onSelectResult={(cfi) => handleJump(cfi)}
      />

      <EpubStyleDrawer
        opened={styleOpened()}
        onClose={() => setStyleOpened(false)}
        onFontSizeChange={handleFontSizeChange}
        onBackgroundColorChange={setBackgroundColor}
      />

      <QuickActionMenu>

        <button type="button" onClick={() => setTocOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconList size={20} />
        </button>

        <button type="button" onClick={() => setSearchOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconSearch size={20} />
        </button>

        <button type="button" onClick={() => setStyleOpened(true)} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          <IconLetterCase size={20} />
        </button>

        <button type="button" onClick={toggleNotes} class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
          {hideNotes() ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </QuickActionMenu>

    </Box>

  )


}

export default Reader;