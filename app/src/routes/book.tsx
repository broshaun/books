import { createFileRoute } from '@tanstack/react-router'
import React, { } from "react"
import { Outlet, useNavigate } from '@tanstack/react-router';
import { AppShell, Group, Center, Button, Stack, Text, Indicator } from "@mantine/core";
import { IconBooks, IconUserCircle, IconHome } from "@tabler/icons-react";
import { AppBar } from "@/components/AppBar";
import { useAppBar } from "@/store/useAppBar";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/store/useSafety";


export const Route = createFileRoute('/book')({
  component: Layout,
})

interface ItemProps {
  label: string;
  Icon: React.ComponentType<{ size?: number | string }>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  badge?: boolean | number;
}

function Item({ label, Icon, onClick, badge }: ItemProps) {
  return (
    <Button variant="transparent" color="gray" onClick={onClick} h="100%">
      <Stack align="center" gap={1}>
        <Indicator disabled={!badge} color="red" size={8} offset={4} withBorder >
          <Icon size={20} />
        </Indicator>
        <Text size="xs">{label}</Text>
      </Stack>
    </Button>
  );
}

function Layout() {
  const navigate = useNavigate();
  const { title, Left, Right, setTitle } = useAppBar();
  const { top, bottom } = useSafety()
  const { height } = winSize();
  const setHeight = useStore2(s => s.setHeight)
  setHeight(height - 100 - bottom - top)


  const visibleItems = [
    { key: 'home', display: true, icon: <Item label="主页" Icon={IconHome} onClick={() => { setTitle('主页'); navigate({ to: "/book/shelf" }); }} /> },
    { key: 'books', display: true, icon: <Item label="书架" Icon={IconBooks} onClick={() => { setTitle('书架'); navigate({ to: "/book/shelf" }); }} /> },
    { key: 'self', display: true, icon: <Item label="我的" Icon={IconUserCircle} onClick={() => { setTitle('我的'); }} /> },
  ];

  return (
    <AppShell
      padding={0}
      transitionDuration={200}
      header={{ height: 50 + top }}
      footer={{ height: 50 + bottom }}
    >

      <AppShell.Header pt={top}>
        <AppBar title={title} >
          <AppBar.Left enable={!!Left} icon={Left} />
          <AppBar.Right enable={!!Right} icon={Right} />
        </AppBar>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <AppShell.Footer pb={bottom}>
        <Group grow gap={1} h="100%" align="center" >
          {visibleItems.map((item) => <Center key={item.key}>{item.icon}</Center>)}
        </Group>
      </AppShell.Footer>

    </AppShell>

  );
}
