import { useState } from 'react';
import {
  Drawer,
  Stack,
  Text,
  UnstyledButton,
  Divider,
  Group,
  Checkbox,
} from '@mantine/core';
import {
  IconBooks,
  IconFolder,
  IconFolderPlus,
  IconFolderX,
} from '@tabler/icons-react';

export interface Folder {
  id: number;
  name: string;
  path: string;
}

export interface BookDirectoryDrawerProps {
  opened: boolean;
  onClose?: () => void;
  folders: Folder[];
  onSelectFolder?: (path: string) => void;
  onAddFolder?: () => void;
  onDeleteFolders?: (ids: number[]) => void;
}

export function BookDirectoryDrawer({
  opened,
  onClose,
  folders = [],
  onSelectFolder,
  onAddFolder,
  onDeleteFolders,
}: BookDirectoryDrawerProps) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleFolder = (id: number) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedIds.length) return;
    onDeleteFolders?.(selectedIds);
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const handleCancelDelete = () => {
    setSelectedIds([]);
    setDeleteMode(false);
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => onClose?.()}
      position="left"
      padding="md"
      size="md"
      withCloseButton={false}
      styles={{
        content: {
          minWidth: '180px',
          maxWidth: '30vw',
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          height: '100%',
        },
      }}
    >
      <Group gap="sm" mb="sm">
        <IconBooks size={20} />
        <Text fw={600} size="lg">
          我的书籍
        </Text>
      </Group>

      <Divider mb="md" />

      <div className="flex-1 overflow-auto">
        <Stack gap="xs">
          {folders.map((folder) => {
            const checked = selectedIds.includes(folder.id);

            return (
              <UnstyledButton
                key={folder.id}
                onClick={() => {
                  if (deleteMode) {
                    toggleFolder(folder.id);
                    return;
                  }
                  onSelectFolder?.(folder.path);
                  onClose?.();
                }}
                className="
                  flex
                  items-center
                  gap-2
                  w-full
                  px-3
                  py-2
                  rounded-md
                  hover:bg-gray-100
                  dark:hover:bg-zinc-800
                  transition-colors
                "
              >
                {deleteMode ? (
                  <Checkbox
                    checked={checked}
                    onChange={() => {}}
                    tabIndex={-1}
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <IconFolder size={16} />
                )}

                <Text
                  size="sm"
                  truncate
                  style={{ flex: 1, textAlign: 'left' }}
                >
                  {folder.name}
                </Text>
              </UnstyledButton>
            );
          })}

          {!folders.length && (
            <Text size="xs" c="dimmed" ta="center" py="xl">
              暂无文件夹
            </Text>
          )}
        </Stack>
      </div>

      <Divider my="md" />

      <Stack gap="xs">
        {!deleteMode && (
          <>
            <UnstyledButton
              onClick={() => onAddFolder?.()}
              className="
                flex
                items-center
                gap-2
                w-full
                px-3
                py-2
                rounded-md
                hover:bg-gray-100
                dark:hover:bg-zinc-800
                transition-colors
                text-blue-500
              "
            >
              <IconFolderPlus size={18} />
              <Text size="sm" fw={500}>
                添加
              </Text>
            </UnstyledButton>

            <UnstyledButton
              onClick={() => setDeleteMode(true)}
              disabled={!folders.length}
              className="
                flex
                items-center
                gap-2
                w-full
                px-3
                py-2
                rounded-md
                hover:bg-red-50
                dark:hover:bg-red-950
                transition-colors
                text-red-500
                disabled:opacity-40
              "
            >
              <IconFolderX size={18} />
              <Text size="sm" fw={500}>
                移除
              </Text>
            </UnstyledButton>
          </>
        )}

        {deleteMode && (
          <Group grow gap="xs">
            <UnstyledButton
              onClick={handleConfirmDelete}
              disabled={!selectedIds.length}
              className="
                flex
                items-center
                justify-center
                px-3
                py-2
                rounded-md
                hover:bg-green-50
                dark:hover:bg-green-950
                transition-colors
                disabled:opacity-40
              "
            >
              <Text size="sm" fw={500} c="green">
                确认
              </Text>
            </UnstyledButton>

            <UnstyledButton
              onClick={handleCancelDelete}
              className="
                flex
                items-center
                justify-center
                px-3
                py-2
                rounded-md
                hover:bg-red-50
                dark:hover:bg-red-950
                transition-colors
              "
            >
              <Text size="sm" fw={500} c="red">
                取消
              </Text>
            </UnstyledButton>
          </Group>
        )}
      </Stack>
    </Drawer>
  );
}

export default BookDirectoryDrawer;