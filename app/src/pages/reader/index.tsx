import { useEffect, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Box, ActionIcon, Drawer, Paper, Grid } from '@mantine/core';
import {
  IconList,
  IconSearch,
  IconArrowLeft,
  IconEyeOff,
  IconEye,
  IconTypography,
  IconNotebook,
  IconTabs
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useStore2 } from '@/hooks/useStore2';
import { useEpubViews } from './hook/useEpubViews';
import { useEpubResize } from './hook/useEpubResize';
import { useEpubNotes } from './hook/useEpubNotes';
import { useCurrentOperation } from './hook/useCurrentOperation';

import { EpubSearchDrawer } from './ui/EpubSearchDrawer';
import { EpubTocDrawer } from './ui/EpubTocDrawer';
import { EpubStyleDrawer } from './ui/EpubStyleDrawer';
import { QuickActionMenu } from './ui/QuickActionMenu';
import { ReaderWorkspace } from './ui/ReaderWorkspace';
import { EpubNotesEdit } from './ui/EpubNotesEdit';
import { EpubNotesCreate } from './ui/EpubNotesCreate';
import EpubNotesTimeline from './ui/EpubNotesTimeline';
import { useRequest, useCreation } from 'ahooks';
import { createEpubLoader } from '@/mod/lib/createEpubLoader';


interface ReaderProps {
  bookId: string
}

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  updatedAt?: number;
}

export function Reader({ bookId }: ReaderProps) {
  const navigate = useNavigate();
  const height = useStore2((s) => s.height);
  const backgroundColor = useStore2((s) => s.backgroundColor);
  const setBackgroundColor = useStore2(s => s.setBackgroundColor)

  const { openBook } = createEpubLoader()
  const viewerRef = useRef<HTMLDivElement>(null);
  const { data: book } = useRequest(async () => {
    const book = await openBook(bookId)
    return book
  }, {
    onSuccess: async (book) => {
      const bookTitle = book?.packaging?.metadata?.title || '';
      console.log('bookTitle',bookTitle)
      // 获取书本唯一号 (identifier)
      const bookIdentifier = book?.packaging?.metadata?.identifier || '';
      console.log('bookIdentifier',bookIdentifier)
    }
  })

  const instance = useCreation(() => {
    if (!viewerRef.current || !book) return;
    const instance = book.renderTo(viewerRef.current, {
      flow: 'scrolled',
      width: '100%',
      height: '100%',
      allowScriptedContent: true,
    });
    return instance
  }, [book]);

  useEffect(() => {
    if (!instance) return;
    // 用户行为监听
    let contentHandler: ((contents: any) => void) | undefined;
    contentHandler = (contents: any) => {
      const doc = contents.document;
      doc.addEventListener('mousedown', () => handleClick('mousedown'));
      doc.addEventListener('mouseup', () => handleClick('mouseup'));
    };

    
    instance.hooks.content.register(contentHandler);
    instance.on('markClicked', handleMarkClicked);
    instance.on('selected', handleSelected);
    instance.on('relocated', handleRelocated);
    const savedCfi = localStorage.getItem('READ_POSITION_KEY');
    instance.display(savedCfi || undefined);
    return () => {
      instance.destroy();
    }
  }, [instance])

  const { currentSet, opt } = useCurrentOperation<string>([], { interval: 100 });

  // 独立的 Drawer 状态
  const [menuOpened, setMenuOpened] = useState(false);
  const [tocOpened, setTocOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const [styleOpened, setStyleOpened] = useState(false);

  const { hideNotes, toggleNotes } = useEpubViews(instance);
  const { put: newNode, remove, current, currentIndexNodes } = useEpubNotes(instance ?? null, bookId)

  const [activeNote, setActiveNote] = useState<NewNote>();
  const [showNote, setShowNotes] = useState(false);
  const triggerResize = useEpubResize(viewerRef, instance ?? null);


  // 统一跳转处理：跳转后自动关闭顶部菜单
  const handleJump = useMemoizedFn((cfiOrHref: string) => {
    instance?.display(cfiOrHref);
    setMenuOpened(false);
  });

  const handleClick = useMemoizedFn((click) => {
    if (click === 'mouseup' && currentSet.has('select')) {
      opt('select')
    } if (click === 'mousedown' && currentSet.has('mark'))
      opt('mark')
    else {
      opt('click')
    }
    setStyleOpened(false);
    setMenuOpened(false)
  });

  const handleMarkClicked = useMemoizedFn((cfiRange: string) => {
    opt('mark')
    console.log('选中高亮++', cfiRange);
    setShowNotes(true);
  });

  const handleSelected = useMemoizedFn((cfiRange: string, contents: any) => {
    // 选中文字
    const index = contents?.sectionIndex
    const text = instance?.getRange(cfiRange)?.toString() || '';
    if (!text.trim()) return;
    opt('select')
    setShowNotes(true)
    const newNoteItem: NewNote = {
      book: bookId,
      index: index,
      cfiRange: cfiRange,
      text: text.trim(),
      updatedAt: Date.now(),
    };
    setActiveNote(newNoteItem);
    setShowNotes(true);

  });


  const handleFontSizeChange = useMemoizedFn((size: number) => {
    if (instance) {
      instance.themes.fontSize(`${size}px`);
    }
  });

  const handleRelocated = useMemoizedFn((location: any) => {
    const cfi = location?.start?.cfi;
    if (cfi) localStorage.setItem('READ_POSITION_KEY', cfi);
  });


  // 跳转标签
  const handleJumpCfiRange = useMemoizedFn(async (cfiRange: string) => {
    if (!instance) return;
    return await instance.display(cfiRange);
  });




  let content;
  if (currentSet.has('select')) {
    content = (<EpubNotesCreate newNote={activeNote} onSave={(v) => { newNode(v); opt('mark') }} />);
  } else if (currentSet.has('mark')) {
    content = (<EpubNotesEdit notes={current} onNoteChange={(v) => { newNode(v) }} onDelete={(cfiRange) => { remove(cfiRange); }} />);
  } else if (currentSet.has('click')) {
    content = (<EpubNotesTimeline notes={currentIndexNodes} onSelectNote={(cfiRange) => { handleJumpCfiRange(cfiRange) }} />);
  } else {
    content = <div>无内容</div>
  }

  console.log('instance', instance)
  console.log('current', current)
  console.log('currentSet', currentSet)

  return (
    <Box>
      <ReaderWorkspace showNote={showNote} height={height}>
        <ReaderWorkspace.Epub>
          <Paper ref={viewerRef} h="100%" w="100%" bg={backgroundColor} />
        </ReaderWorkspace.Epub>
        <ReaderWorkspace.Notes >
          {content}
        </ReaderWorkspace.Notes>
      </ReaderWorkspace>

      {/* 顶部菜单 Drawer */}
      <Drawer
        p={0}
        opened={menuOpened}
        size={65}
        onClose={() => setMenuOpened(false)}
        withCloseButton={false}
        position="top"
        withOverlay={false}
      >
        <Grid align="flex-end" >
          <Grid.Col span={1}>
            <ActionIcon variant="subtle" onClick={() => navigate({ to: '/book/shelf' })}>
              <IconArrowLeft color="gray" />
            </ActionIcon>
          </Grid.Col>
          <Grid.Col span={9} />

          <Grid.Col span={1}>
            <ActionIcon variant="subtle" onClick={() => setSearchOpened(true)}>
              <IconSearch color="gray" />
            </ActionIcon>
          </Grid.Col>

          <Grid.Col span={1}>
            <ActionIcon variant="subtle" onClick={() => setStyleOpened(true)}>
              <IconTypography color="gray" />
            </ActionIcon>
          </Grid.Col>


        </Grid>
      </Drawer>

      {/* 各个抽屉独立绑定控制 */}
      <EpubTocDrawer
        opened={tocOpened}
        onClose={() => setTocOpened(false)}
        book={book}
        onSelectChapter={(href) => { handleJump(href); console.log('href++', href) }}
      />

      <EpubSearchDrawer
        opened={searchOpened}
        onClose={() => setSearchOpened(false)}
        book={book}
        onSelectResult={(cfi) => handleJump(cfi)}
      />

      <EpubStyleDrawer
        opened={styleOpened}
        onClose={() => setStyleOpened(false)}
        onFontSizeChange={handleFontSizeChange}
        onBackgroundColorChange={setBackgroundColor}
      />

      <QuickActionMenu>

        <ActionIcon variant="subtle" onClick={() => { setMenuOpened((prev) => !prev) }}>
          <IconTabs size={20} color="gray" />
        </ActionIcon>

        <ActionIcon variant="subtle" onClick={() => setTocOpened(true)}>
          <IconList color="gray" />
        </ActionIcon>

        <ActionIcon variant="subtle" onClick={() => { setShowNotes((prev) => !prev); triggerResize(); }}>
          <IconNotebook size={20} />
        </ActionIcon>

        <ActionIcon variant="subtle" radius="xl" onClick={toggleNotes}>
          {hideNotes ? <IconEye size={20} color="gray" /> : <IconEyeOff size={20} color="gray" />}
        </ActionIcon>

      </QuickActionMenu>

    </Box>
  );
}

export default Reader;