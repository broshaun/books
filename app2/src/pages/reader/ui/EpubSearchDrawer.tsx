import React, { useState, useRef, useCallback } from 'react';
import {
  Drawer,
  TextInput,
  ScrollArea,
  Flex,
  Loader,
  Text,
  Highlight,
  Paper,
  Stack,
  CloseButton,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export interface SearchResult {
  cfi: string;
  excerpt: string;
}

export interface EpubSearchDrawerProps {
  opened: boolean;
  onClose: () => void;
  book: any;
  onSelectResult: (cfi: string, keyword: string) => void;
  size?: string | number;
}

export function EpubSearchDrawer({
  opened,
  onClose,
  book,
  onSelectResult,
  size = '90%',
}: EpubSearchDrawerProps) {
  const [results, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [lastSearched, setLastSearched] = useState('');
  const searchTokenRef = useRef(0);

  // 清除状态
  const handleClear = useCallback(() => {
    searchTokenRef.current++;
    setQuery('');
    setLastSearched('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const handleClose = () => {
    handleClear();
    onClose();
  };

  // 执行 EPUB 全文搜索
  const executeSearch = useCallback(
    async (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed || !book) return handleClear();

      const currentToken = ++searchTokenRef.current;
      setIsSearching(true);
      setLastSearched(trimmed);

      try {
        await book.ready;
        const spineItems = book.spine?.spineItems || book.spine?.items || [];
        const matchesList: SearchResult[] = [];

        for (const item of spineItems) {
          if (currentToken !== searchTokenRef.current) return;

          try {
            await item.load(book.load.bind(book));
            const matches = item.find(trimmed);

            if (matches?.length) {
              const fullText = (item.document?.body?.innerText || '').replace(/\s+/g, ' ');

              matches.forEach((m: any) => {
                let excerpt = m.excerpt || m.text || '';

                // 补充富上下文片段（前后各 40 字符）
                if (excerpt.length < 30 && fullText) {
                  const idx = fullText.toLowerCase().indexOf(trimmed.toLowerCase());
                  if (idx !== -1) {
                    const start = Math.max(0, idx - 40);
                    const end = Math.min(fullText.length, idx + trimmed.length + 40);
                    excerpt = `...${fullText.substring(start, end)}...`;
                  }
                }

                matchesList.push({
                  cfi: m.cfi, // 精准字符偏移量的 epubcfi
                  excerpt: excerpt || `匹配关键词 "${trimmed}"`,
                });
              });
            }
            item.unload();
          } catch {
            /* 忽略单个章节解析失败 */
          }
        }

        if (currentToken === searchTokenRef.current) {
          setSearchResults(matchesList);
        }
      } catch (err) {
        console.error('EPUB Search Error:', err);
      } finally {
        if (currentToken === searchTokenRef.current) {
          setIsSearching(false);
        }
      }
    },
    [book, handleClear]
  );

  return (
    <Drawer opened={opened} onClose={handleClose} position="bottom" size={size} title="搜索书中内容">
      <Flex direction="column" h="100%" p="sm" rowGap="sm">
        <TextInput
          placeholder="输入关键词，按 Enter 搜索..."
          leftSection={<IconSearch size={16} />}
          rightSection={query ? <CloseButton size="sm" onClick={handleClear} /> : null}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), executeSearch(query))}
          radius="md"
          autoFocus
        />

        <ScrollArea flex={1} type="auto" offsetScrollbars>
          {isSearching ? (
            <Flex justify="center" align="center" p="xl">
              <Loader size="sm" />
              <Text size="xs" c="dimmed" ml="xs">正在检索全书内容...</Text>
            </Flex>
          ) : lastSearched && results.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" pt="xl">
              未找到包含“{lastSearched}”的内容
            </Text>
          ) : (
            <Stack gap="xs">
              {results.map((item, index) => (
                <Paper
                  key={index}
                  p="xs"
                  radius="sm"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSelectResult(item.cfi, lastSearched);
                    handleClose();
                  }}
                >
                  <Highlight highlight={lastSearched} size="xs" lineClamp={2}>
                    {item.excerpt}
                  </Highlight>
                </Paper>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Flex>
    </Drawer>
  );
}