import { Timeline, Text, Box, Group, Stack } from '@mantine/core';
import { IconQuote } from '@tabler/icons-react';
import { useState, useMemo } from 'react';

export interface NewNote {
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

interface EpubNotesTimelineProps {
  notes: NewNote[];
  onSelectNote?: (cfiRange: string) => void;
}

const extractCfiPosition = (cfi: string): number[] => {
  const matches = cfi.match(/!\/[\d/]+/);
  return matches ? matches[0].split('/').map(v => parseInt(v, 10) || 0) : [0];
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export function EpubNotesTimeline({ notes, onSelectNote }: EpubNotesTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedNotes = useMemo(() => 
    [...notes].sort((a, b) => {
      const posA = extractCfiPosition(a.cfiRange);
      const posB = extractCfiPosition(b.cfiRange);
      for (let i = 0; i < Math.max(posA.length, posB.length); i++) {
        const diff = (posA[i] || 0) - (posB[i] || 0);
        if (diff !== 0) return diff;
      }
      return a.cfiRange.localeCompare(b.cfiRange);
    }), 
  [notes]);

  if (!sortedNotes.length) {
    return <Box p="md" ta="center"><Text size="sm" c="dimmed">当前章节暂无笔记</Text></Box>;
  }

  return (
    <Box p={{ base: 'xs', sm: 'md' }} style={{ overflowY: 'auto', height: '100%', wordBreak: 'break-all' }}>
      <Timeline active={activeIndex} lineWidth={3} bulletSize={20}>
        {sortedNotes.map((note, index) => (
          <Timeline.Item
            key={note.cfiRange}
            onClick={() => {
              setActiveIndex(index);
              onSelectNote?.(note.cfiRange);
            }}
            style={{ cursor: 'pointer' }}
            title={
              <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                <Text size="sm" fw={600} c="var(--mantine-color-text)" truncate style={{ flex: 1, minWidth: 0 }}>
                  {note.title || '读书笔记'}
                </Text>
                {note.updatedAt && <Text size="10px" c="dimmed" style={{ flexShrink: 0 }}>{formatTime(note.updatedAt)}</Text>}
              </Group>
            }
          >
            <Box p={{ base: 6, sm: 'xs' }} mt={6} style={{ borderRadius: 'var(--mantine-radius-default)', border: '1px solid var(--mantine-color-default-border)' }}>
              {note.text && (
                <Group gap={6} align="flex-start" wrap="nowrap">
                  <IconQuote size={12} style={{ marginTop: 2, flexShrink: 0, color: note.color || 'var(--mantine-color-dimmed)' }} />
                  <Text size="xs" lineClamp={2} style={{ flex: 1, color: note.color || 'var(--mantine-color-dimmed)' }}>{note.text}</Text>
                </Group>
              )}
            </Box>
          </Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
}

export default EpubNotesTimeline;