import { useState, useCallback } from 'react';
import {
  Drawer,
  Stack,
  Text,
  Group,
  ActionIcon,
  CheckIcon,
  Center,
  UnstyledButton,
  Divider,
} from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
}

export const READER_THEMES: ThemeOption[] = [
  { id: 'default', name: '默认白', bg: '#ffffff' },
  { id: 'sepia', name: '羊皮纸', bg: '#f4ebd9' },
  { id: 'eye-green', name: '护眼绿', bg: '#c7edcc' },
  { id: 'gray', name: '优雅灰', bg: '#e9ecef' },
];

const DEFAULT_CONFIG = { FONT_SIZE: 18, THEME: 'default' };
const STORAGE_KEYS = { FONT_SIZE: 'READ_FONT_SIZE_KEY', THEME: 'READ_THEME_KEY' };

// 局部组件：主题按钮
function ThemeOptionItem({
  theme,
  isSelected,
  onSelect,
}: {
  theme: ThemeOption;
  isSelected: boolean;
  onSelect: (id: string, theme: ThemeOption) => void;
}) {
  return (
    <Stack align="center" gap={4}>
      <UnstyledButton
        onClick={() => onSelect(theme.id, theme)}
        aria-label={theme.name}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: theme.bg,
          border: isSelected ? '2px solid #228be6' : '1px solid #dee2e6',
          transition: 'all 0.15s ease',
        }}
      >
        {isSelected && (
          <Center h="100%">
            <CheckIcon style={{ width: 14, height: 14, color: '#228be6' }} />
          </Center>
        )}
      </UnstyledButton>
      <Text size="xs" c="dimmed">
        {theme.name}
      </Text>
    </Stack>
  );
}

export interface EpubStyleDrawerProps {
  opened: boolean;
  onClose: () => void;
  onFontSizeChange?: (size: number) => void;
  onBackgroundColorChange?: (backgroundColor: string) => void;
}

export function EpubStyleDrawer({
  opened,
  onClose,
  onFontSizeChange: externalFontSizeChange,
  onBackgroundColorChange,
}: EpubStyleDrawerProps) {
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return saved ? parseInt(saved, 10) : DEFAULT_CONFIG.FONT_SIZE;
  });

  const [currentTheme, setCurrentTheme] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_CONFIG.THEME
  );

  // 修改字号
  const handleFontSizeChange = useCallback(
    (delta: number) => {
      const nextSize = Math.min(Math.max(fontSize + delta, 12), 32);
      setFontSize(nextSize);
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, `${nextSize}`);
      externalFontSizeChange?.(nextSize);
    },
    [fontSize, externalFontSizeChange]
  );

  // 修改主题与背景色
  const handleThemeChange = useCallback(
    (themeId: string) => {
      const activeTheme = READER_THEMES.find((t) => t.id === themeId) || READER_THEMES[0];
      setCurrentTheme(themeId);
      localStorage.setItem(STORAGE_KEYS.THEME, themeId);
      
      onBackgroundColorChange?.(activeTheme.bg);
    },
    [onBackgroundColorChange]
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="320px"
      title={<Text fw={600}>阅读设置</Text>}
      withOverlay={false}
    >
      <Stack gap="md" pb="md">
        {/* 字号控制 */}
        <Stack gap="sm">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            字号控制
          </Text>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              字号大小
            </Text>
            <Group gap="xs">
              <ActionIcon
                variant="default"
                size="md"
                onClick={() => handleFontSizeChange(-1)}
                disabled={fontSize <= 12}
              >
                <IconMinus size={16} />
              </ActionIcon>
              <Text size="sm" fw={600} ta="center" w={45}>
                {fontSize}px
              </Text>
              <ActionIcon
                variant="default"
                size="md"
                onClick={() => handleFontSizeChange(1)}
                disabled={fontSize >= 32}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>

        <Divider my="xs" />

        {/* 主题背景 */}
        <Stack gap="sm">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            主题背景
          </Text>
          <Group justify="space-between" gap="xs">
            {READER_THEMES.map((theme) => (
              <ThemeOptionItem
                key={theme.id}
                theme={theme}
                isSelected={currentTheme === theme.id}
                onSelect={handleThemeChange}
              />
            ))}
          </Group>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default EpubStyleDrawer;