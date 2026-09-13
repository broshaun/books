import { Stack, Text, UnstyledButton, Group } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

export interface BookItem {
  name: string;
  path: string;
  cover?: string;
}

export interface BookShelfProps {
  books: BookItem[];
  height?: string | number;
  onSelectBook: (book: BookItem) => void;
}

export function BookShelf({ books, height, onSelectBook }: BookShelfProps) {
  return (
    <Stack gap="xs" p="md" style={{ height, overflowY: height ? 'auto' : undefined }}>
      {books.map((book) => (
        <UnstyledButton
          key={book.path}
          onClick={() => onSelectBook(book)}
          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors shadow-sm"
        >
          <Group gap="md" wrap="nowrap">
            {book.cover ? (
              <img src={book.cover} alt={book.name} className="w-10 h-14 object-cover rounded shrink-0" />
            ) : (
              <div className="w-10 h-14 bg-gray-100 dark:bg-zinc-800 rounded flex items-center justify-center text-gray-400 shrink-0">
                <IconBook size={20} stroke={1.5} />
              </div>
            )}
            
            <Text size="sm" fw={500} truncate className="flex-1 text-left">
              {book.name}
            </Text>
          </Group>
        </UnstyledButton>
      ))}

      {!books.length && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          书架空空如也，请先选择或添加文件夹
        </Text>
      )}
    </Stack>
  );
}

export default BookShelf;