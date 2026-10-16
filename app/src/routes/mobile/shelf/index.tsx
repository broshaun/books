import Shelf from '@/pages/mobile/shelf'
// import { createEffect } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
// import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute('/mobile/shelf/')({
  component: RouteComponent,
})

function RouteComponent() {
  const safety = useSafety();
  // const { height } = winSize();

  // createEffect(() => {
  //   useStore2.setHeight(height - 30);
  // });

  return (
    <AppShell
      header={{ padding: 30, height: 50 }}
      navbar={{ padding: safety.top() }}
      aside={{ padding: safety.bottom() }}
      footer={{ height: 0 }}
    >
      <AppShell.Header>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
          theme="zinc"
        />
      </AppShell.Header>
      {/* <AppShell.Navbar /> */}
      {/* <AppShell.Aside /> */}
      <AppShell.Main
        ref={(el) => {
          requestAnimationFrame(() => { useStore2.setHeight(el.clientHeight) });
        }}
      >
        <Shelf />

      </AppShell.Main>
      {/* <AppShell.Footer /> */}
    </AppShell>
  )


}
