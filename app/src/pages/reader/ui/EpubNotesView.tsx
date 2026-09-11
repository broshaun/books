import { useState } from 'react';
import { Stack, Group, ActionIcon, Tooltip, Text, Box } from '@mantine/core';
import { IconCopy, IconCheck, IconEdit, IconQuote, IconTrash } from '@tabler/icons-react';

interface EpubNotesViewProps {
  title?: string;
  subtitleValue?: string;
  note: string;
  onEditClick: () => void;
  onDelete?: () => void;
}

export function EpubNotesView({
  title,
  subtitleValue,
  note,
  onEditClick,
  onDelete,
}: EpubNotesViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!subtitleValue) return;
    try {
      await navigator.clipboard.writeText(subtitleValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <Stack h="100%" p="sm" gap="xs" style={{ boxSizing: 'border-box' }}>
      <Group justify="space-between" align="center" wrap="nowrap" h={24}>
        <Text fw={700} size="sm" truncate style={{ flex: 1 }}>
          {title || '读书笔记'}
        </Text>
        <Group gap={4} style={{ flexShrink: 0 }}>
          <Tooltip label="切换为编辑模式" withArrow>
            <ActionIcon variant="subtle" size="xs" onClick={onEditClick}>
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="删除笔记" withArrow>
            <ActionIcon variant="subtle" color="red" size="xs" onClick={onDelete}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {subtitleValue && (
        <Box
          px="xs"
          py={4}
          style={{
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-default-hover)',
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
            <Group gap={4} align="center" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <IconQuote size={12} style={{ flexShrink: 0, color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
                {subtitleValue}
              </Text>
            </Group>
            <Tooltip label={copied ? '已复制' : '复制引用'} withArrow>
              <ActionIcon variant="subtle" size="xs" onClick={handleCopy} style={{ flexShrink: 0 }}>
                {copied ? <IconCheck size={12} color="teal" /> : <IconCopy size={12} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      )}

      <Box
        p="xs"
        style={{
          flex: 1,
          borderRadius: 'var(--mantine-radius-sm)',
          border: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-default-hover)',
          overflowY: 'auto',
          fontSize: '13px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {note || <Text c="dimmed" size="xs">暂无内容，点击右上角编辑图标开始编写...</Text>}
      </Box>
    </Stack>
  );
}

export default EpubNotesView;