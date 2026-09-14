import { useState, useEffect } from 'react';
import { Stack, Textarea, TextInput, Group, ActionIcon, Tooltip, ColorSwatch, Text, Popover, Box } from '@mantine/core';
import { IconCopy, IconUnderline, IconCheck, IconQuote, IconTrash } from '@tabler/icons-react';

export interface NoteItem {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

interface EpubNotesEditProps {
  data?: NoteItem | null;
  notes?: NoteItem | null;
  onNoteChange: (data: NoteItem) => void;
  onDelete?: (cfiRange: string) => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#fffa65' },
  { id: 'purple', name: '淡紫', bg: '#cd84f1' },
  { id: 'red', name: '浅红', bg: '#ff4d4d' },
  { id: 'cyan', name: '青蓝', bg: '#7efff5' },
  { id: 'green', name: '草绿', bg: '#2ed573' },
];

const getInitialNote = (data?: NoteItem | null, notes?: NoteItem | null): NoteItem => {
  if (data) return data;
  if (notes) return notes;
  return {
    book: '',
    index: Date.now(),
    title: '读书笔记',
    cfiRange: '',
    text: '',
    color: HIGHLIGHT_COLORS[0].bg,
    isUnderline: false,
    content: '',
  };
};

export function EpubNotesEdit({ data, notes, onNoteChange, onDelete }: EpubNotesEditProps) {
  const [currentNote, setCurrentNote] = useState<NoteItem>(() => getInitialNote(data, notes));
  const [copied, setCopied] = useState(false);
  const [popoverOpened, setPopoverOpened] = useState(false);

  useEffect(() => {
    setCurrentNote(getInitialNote(data, notes));
  }, [data, notes]);

  const handleFieldChange = (fields: Partial<NoteItem>) => {
    const updated = { ...currentNote, ...fields, updatedAt: Date.now() };
    setCurrentNote(updated);
    onNoteChange(updated);
  };

  const selectedColorObj = HIGHLIGHT_COLORS.find((c) => c.bg === (currentNote.color || HIGHLIGHT_COLORS[0].bg)) || HIGHLIGHT_COLORS[0];

  const handleCopy = async () => {
    if (!currentNote.text) return;
    try {
      await navigator.clipboard.writeText(currentNote.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <Stack h="100%" p="md" gap="sm" style={{ boxSizing: 'border-box' }}>
      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
        <TextInput
          style={{ flex: 1, minWidth: 0 }}
          variant="unstyled"
          placeholder="输入标题..."
          value={currentNote.title || ''}
          onChange={(e) => handleFieldChange({ title: e.currentTarget.value })}
          styles={{ input: { fontWeight: 700, fontSize: '18px', textAlign: 'center', color: 'var(--mantine-color-text)', padding: 0, minHeight: 'auto' } }}
        />

        <Tooltip label="删除笔记" withArrow>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            style={{ flexShrink: 0 }}
            onClick={() => currentNote.cfiRange && onDelete?.(currentNote.cfiRange)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {currentNote.text && (
        <Box
          px="xs"
          py={6}
          style={{
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-default-hover)',
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
            <Group gap={6} align="flex-start" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <IconQuote size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" lineClamp={2} style={{ wordBreak: 'break-word', flex: 1 }}>
                {currentNote.text}
              </Text>
            </Group>

            <Group gap={4} style={{ flexShrink: 0 }}>
              <Popover opened={popoverOpened} onChange={setPopoverOpened} position="bottom-end" withArrow>
                <Popover.Target>
                  <Tooltip label="选择高亮颜色" withArrow>
                    <ActionIcon variant="subtle" size="xs" onClick={() => setPopoverOpened((o) => !o)}>
                      <ColorSwatch color={selectedColorObj.bg} size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <Stack gap="xs">
                    <Text size="xs" fw={700} c="dimmed">高亮色彩</Text>
                    <Group gap={6}>
                      {HIGHLIGHT_COLORS.map((c) => (
                        <ColorSwatch
                          key={c.id}
                          color={c.bg}
                          size={20}
                          style={{
                            cursor: 'pointer',
                            outline: selectedColorObj.id === c.id ? '2px solid #228be6' : 'none',
                          }}
                          onClick={() => {
                            handleFieldChange({ color: c.bg });
                            setPopoverOpened(false);
                          }}
                        />
                      ))}
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>

              <Tooltip label={currentNote.isUnderline ? '取消下划线' : '添加下划线'} withArrow>
                <ActionIcon
                  variant={currentNote.isUnderline ? 'filled' : 'subtle'}
                  color={currentNote.isUnderline ? 'blue' : 'gray'}
                  size="xs"
                  onClick={() => handleFieldChange({ isUnderline: !currentNote.isUnderline })}
                >
                  <IconUnderline size={14} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={copied ? '已复制' : '复制引用'} withArrow>
                <ActionIcon variant="subtle" size="xs" onClick={handleCopy}>
                  {copied ? <IconCheck size={14} color="teal" /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Box>
      )}

      <Textarea
        placeholder="在此记录读书心得..."
        value={currentNote.content || ''}
        onChange={(e) => handleFieldChange({ content: e.currentTarget.value })}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        styles={{
          wrapper: { flex: 1, display: 'flex' },
          input: { flex: 1, height: '100%', resize: 'none', fontSize: '14px', lineHeight: '1.6' },
        }}
      />
    </Stack>
  );
}

export default EpubNotesEdit;