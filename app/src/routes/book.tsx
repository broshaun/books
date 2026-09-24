import { createEffect } from "solid-js";
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";


export const Route = createFileRoute("/book")({
  component: Layout,
});

function Layout() {
  const safety = useSafety();
  const { height } = winSize();

  createEffect(() => {
    useStore2.setHeight(height - 50 - safety.bottom() - safety.top());
  });

  return (
    <AppShell header={{ height: 50 + safety.top() }}>
      <AppShell.Header pt={50 + safety.top()}>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
          theme="zinc"
        />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}