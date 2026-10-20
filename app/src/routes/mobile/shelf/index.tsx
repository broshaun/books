import Shelf from '@/pages/mobile/shelf'
import { createEffect } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { useSafeArea } from '@/hooks/useSafeArea';


export const Route = createFileRoute('/mobile/shelf/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { height, width } = winSize();
  const safely = useSafeArea();

  createEffect(() => {
    useStore2.setHeight(height);
    useStore2.setWidth(width);
  });

  // return <div style={{ width: `${width}px`, height: `${height}px` }} class="bg-black"></div>
  return (
    <AppShell
      header={{ height: 50, padding: safely().top }}
      footer={{ height: 0 }}
      navbar={{ padding: 0 }}
      aside={{ padding: 0 }}

    >
      <AppShell.Header>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
          theme="zinc"
        />
      </AppShell.Header>
      <AppShell.Main >
        <Shelf />

      </AppShell.Main>
    </AppShell>
  )


}
