import { IconList, IconSearch, IconEyeOff, IconEye, IconLetterCase, IconTagPlus } from "@tabler/icons-solidjs";
import { createSignal, onCleanup, createEffect, createResource, on, Show, Switch, Match } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubViews } from "./hook/useEpubViews";
import { useEpubNotes } from "./hook/useEpubNotes";
import { useEpubLoader } from "./hook/useEpubLoader";
import { useCurrentOperation } from "./hook/useCurrentOperation";

import { EpubSearchDrawer } from "./ui/EpubSearchDrawer";
import { EpubTocDrawer } from "./ui/EpubTocDrawer";
import { EpubStyleDrawer } from "./ui/EpubStyleDrawer";
import { QuickActionMenu } from "./ui/QuickActionMenu";
import { useBookmarks } from "./hook/useBookmarks";
import { useEpubNotesSync } from "./hook/useEpubNotesSync";
import { notesCache } from "@/api/cache/notesCache";
import EpubView from "./ui/EpubView";

// 笔记与抽屉组件
import { EpubDrawer } from "./ui/EpubDrawer";
import { EpubNotesCreate } from "./ui/EpubNotesCreate";
import { EpubNotesEdit } from "./ui/EpubNotesEdit";
import { EpubNotesTimeline } from "./ui/EpubNotesTimeline";
import { debounce } from "@solid-primitives/scheduled";
import { type Rendition } from "epubjs"


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

  const [currentCfi, setCfi] = createSignal<string>();

  const { openBook } = useEpubLoader();
  const [currentBook] = createResource(
    () => props.path,
    async () => {
      const book = await openBook(props.path);
      const bookTitle = book?.packaging?.metadata?.title || "";
      const bookIdentifier = book?.packaging?.metadata?.identifier || "";
      console.log("bookTitle", bookTitle);
      console.log("bookIdentifier", bookIdentifier);
      return book;
    }
  );




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
  const { put: newNode, remove, currentNote, indexTags, currentIndexNotes, filter } = useEpubNotes(instance);
  const [activeNote, setActiveNote] = createSignal<NewNote>();

  const { isSyncing } = useEpubNotesSync({
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
    const hasSelection = currentSet().has("select");
    if (!hasSelection) {
      opt("click");
    }
  };

  function handleMarkClicked(cfiRange: string) {
    opt("mark");
    console.log('选中文字', cfiRange);
  };

  function handleSelected(cfiRange: string, contents: any) {
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



  function handleRelocated(location: any) {
    const cfi = location?.start?.cfi;
    if (!cfi) return;
    setCfi(cfi);
    savePositionDebounced(cfi);
  };


  async function handleJumpCfiRange(cfiRange: string) {
    const inst = instance();
    if (!inst) return;
    return await inst.display(cfiRange);
  };


  createEffect(
    on(
      () => instance(),
      async (inst) => {

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
      // { defer: true }
    )
  );

  // 搜索结果
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


  const [notesOpened, setNotesOpened] = createSignal(false);
  const [controlsOpened, setControlsOpened] = createSignal(false);
  const [isPinned, setIsPinned] = createSignal(false);

  return (
    <div class="relative w-screen h-screen overflow-hidden">
      <EpubView
        ref={viewerRef}
        bg={backgroundColor()}
        height={height()}
        onExit={() => { navigate({ to: "/mobile/shelf/" }); console.log('退出'); }}
        onPrevPage={() => { instance()?.prev(); console.log('上一页'); }}
        onNextPage={() => { instance()?.next(); console.log('下一页'); }}
        controlsEnabled={true}
        notesEnabled={true}
        onOpenNotes={() => setNotesOpened(true)}
      />

      {/* 🌟 抽屉面板（支持固定 Pin 状态） */}
      <EpubDrawer
        open={notesOpened()}
        onOpenChange={setNotesOpened}
        bg={backgroundColor()}
        pinned={isPinned()}
        onPinChange={setIsPinned}
      >

        <Switch>
          <Match when={currentSet().has("select")}>
            <EpubNotesCreate
              newNote={activeNote()}
              onSave={(v) => { console.log('new', v); newNode(v); opt("mark"); }}
              onCancel={() => { opt("click"); console.log('取消笔记'); }}
            />
          </Match>

          <Match when={currentSet().has("mark")}>
            <div>修改笔记</div>
            <EpubNotesEdit
              notes={currentNote()}
              onNoteChange={(v) => { newNode(v); }}
              onDelete={(cfiRange) => { remove(cfiRange); }}
              onBack={() => { opt("click"); }}
            />
          </Match>

          <Match when={currentSet().has("click")}>
            <div>笔记列表</div>
            <EpubNotesTimeline
              isSyncing={isSyncing()}
              tags={indexTags()}
              notes={currentIndexNotes()}
              onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange); }}
              onDelete={(cfiRange) => { remove(cfiRange); }}
              onSelectTag={(tag) => { console.log("tag", tag); filter({ tag: tag }); }}
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

      <QuickActionMenu
        position={{ bottom: 30, right: 30 }}
        onOpen={() => { console.log("菜单已打开"); setControlsOpened(true); }}
        onClose={() => { console.log("菜单已关闭"); setControlsOpened(false); }}
      >
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