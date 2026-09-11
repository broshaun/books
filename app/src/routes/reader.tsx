import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@mantine/core';
import { useSafety } from '@/store/useSafety';
import { winSize } from '@/lib/winSize';
import { Outlet } from '@tanstack/react-router';
import { useStore2 } from '@/hooks/useStore2';


export const Route = createFileRoute('/reader')({
  component: Layout,
})


function Layout() {
  const { top, bottom } = useSafety()
  const { height } = winSize();
  const setHeight = useStore2(s => s.setHeight)
  setHeight(height - bottom - top)

  console.log('height',height)

  return (
    <AppShell
      padding={0}
      transitionDuration={200}
      header={{ height: top }}
      footer={{ height: bottom }}
    >
      <AppShell.Header pt={top} />
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <AppShell.Footer pb={bottom} />
    </AppShell>
  );
}