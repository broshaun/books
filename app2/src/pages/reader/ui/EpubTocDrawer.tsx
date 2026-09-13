import React, { useEffect, useState } from 'react';
import { Drawer, ScrollArea, NavLink, Text, Loader, Flex } from '@mantine/core';
import type { NavItem } from 'epubjs';

export interface EpubTocDrawerProps {
  opened: boolean;
  onClose: () => void;
  book: any;
  onSelectChapter: (href: string) => void;
  size?: string | number;
}

export function EpubTocDrawer({
  opened,
  onClose,
  book,
  onSelectChapter,
  size = '80%',
}: EpubTocDrawerProps) {
  const [toc, setToc] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!book) return;
    let isMounted = true;
    setLoading(true);

    book.loaded.navigation
      .then((nav: any) => isMounted && setToc(nav.toc || []))
      .catch((err: any) => console.error('加载目录失败:', err))
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [book]);

  // 递归渲染目录项
  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const hasChildren = Boolean(item.subitems?.length);

      return (
        <NavLink
          key={item.href || item.id}
          childrenOffset={16}
          defaultOpened={false}
          label={
            <Text
              size="sm"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                // 🌟 阻止冒泡，避免触发 NavLink 原生的展开/收起切换逻辑
                e.stopPropagation();
                onSelectChapter(item.href);
                onClose();
              }}
            >
              {item.label.trim()}
            </Text>
          }
        >
          {hasChildren ? renderNavItems(item.subitems!) : null}
        </NavLink>
      );
    });

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size={size} title="目录">
      <ScrollArea type="auto" offsetScrollbars h="calc(100vh - 80px)">
        {loading ? (
          <Flex justify="center" align="center" pt="xl">
            <Loader size="sm" />
            <Text size="xs" c="dimmed" ml="xs">正在加载目录...</Text>
          </Flex>
        ) : (
          renderNavItems(toc)
        )}
      </ScrollArea>
    </Drawer>
  );
}