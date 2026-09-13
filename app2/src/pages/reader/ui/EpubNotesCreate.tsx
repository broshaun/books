import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, ActionIcon, Tooltip, ColorSwatch, Text, Box, Divider, Button } from '@mantine/core';
import { IconCopy, IconCheck, IconQuote, IconDeviceFloppy, IconX } from '@tabler/icons-react';

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  updatedAt?: number;
}

interface EpubNotesCreateProps {
  newNote?: NewNote;
  onSave: (data: NewNote) => void;
  onCancel?: () => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: '明黄', bg: '#fffa65' },
  { id: 'purple', name: '淡紫', bg: '#cd84f1' },
  { id: 'red', name: '浅红', bg: '#ff4d4d' },
  { id: 'cyan', name: '青蓝', bg: '#7efff5' },
  { id: 'green', name: '草绿', bg: '#2ed573' },
];

const PREF_COLOR_KEY = 'epub_pref_color';

export function EpubNotesCreate({ newNote, onSave, onCancel }: EpubNotesCreateProps) {
  const [draft, setDraft] = useState<NewNote>(() => ({
    book: '',
    index: 0,
    cfiRange: '',
    text: '',
    ...newNote,
    color: newNote?.color || localStorage.getItem(PREF_COLOR_KEY) || HIGHLIGHT_COLORS[0].bg,
  }));

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft({
      book: '',
      index: 0,
      cfiRange: '',
      text: '',
      ...newNote,
      color: newNote?.color || localStorage.getItem(PREF_COLOR_KEY) || HIGHLIGHT_COLORS[0].bg,
    });
  }, [newNote]);

  const currentColor = draft.color || HIGHLIGHT_COLORS[0].bg;

  const handleColorChange = (colorBg: string) => {
    localStorage.setItem(PREF_COLOR_KEY, colorBg);
    setDraft((prev) => ({ ...prev, color: colorBg }));
  };

  const handleCopy = async () => {
    if (!draft.text) return;
    try {
      await navigator.clipboard.writeText(draft.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <Stack h="100%" p="md" pt="xl" gap="md" style={{ boxSizing: 'border-box' }}>
      <TextInput
        variant="unstyled"
        placeholder="输入笔记标题..."
        value={draft.title || ''}
        onChange={(e) => setDraft({ ...draft, title: e.currentTarget.value })}
        styles={{
          input: {
            fontWeight: 600,
            fontSize: '20px',
            textAlign: 'center',
            padding: 0,
            minHeight: 'auto',
            color: 'var(--mantine-color-text)',
            opacity: 0.85,
          },
        }}
      />

      <Divider mb="xs" />

      {draft.text && (
        <Stack gap="md">
          <Group gap={8} px={4}>
            {HIGHLIGHT_COLORS.map((c) => {
              const isSelected = currentColor === c.bg;
              return (
                <Tooltip key={c.id} label={c.name} withArrow>
                  <ColorSwatch
                    color={c.bg}
                    size={18}
                    style={{
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                      boxShadow: isSelected ? '0 0 0 2px var(--mantine-color-body), 0 0 0 4px var(--mantine-color-blue-filled)' : 'none',
                    }}
                    onClick={() => handleColorChange(c.bg)}
                  />
                </Tooltip>
              );
            })}
          </Group>

          <Box
            p="sm"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid var(--mantine-color-default-border)',
              backgroundColor: 'var(--mantine-color-default-hover)',
            }}
          >
            <Group gap={8} align="flex-start" wrap="nowrap">
              <IconQuote size={16} style={{ marginTop: 3, flexShrink: 0, color: 'var(--mantine-color-dimmed)' }} />
              <Text
                size="sm"
                style={{
                  wordBreak: 'break-word',
                  flex: 1,
                  color: 'var(--mantine-color-text)',
                  opacity: 0.9,
                  backgroundColor: currentColor,
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                {draft.text}
              </Text>

              <Tooltip label={copied ? '已复制' : '复制引用'} withArrow>
                <ActionIcon variant="subtle" color="gray" size="sm" radius="md" style={{ flexShrink: 0 }} onClick={handleCopy}>
                  {copied ? <IconCheck size={16} color="teal" /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>

          <Group justify="flex-end" gap="sm">
            {onCancel && (
              <Button variant="subtle" color="gray" size="sm" radius="md" leftSection={<IconX size={16} />} onClick={onCancel}>
                取消
              </Button>
            )}
            <Button variant="light" color="blue" size="sm" radius="md" leftSection={<IconDeviceFloppy size={16} />} onClick={() => onSave(draft)}>
              保存
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
}

export default EpubNotesCreate;