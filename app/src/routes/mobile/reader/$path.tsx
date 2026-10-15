import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";


export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  const safety = useSafety();
  const { height } = winSize();

  createEffect(() => {
    useStore2.setHeight(height - 50);
  });

  return (
    <AppShell
      header={{ padding: 50 }}
      navbar={{ padding: safety.top() }}
      aside={{ padding: safety.bottom() }}
      footer={{ height: 0 }}
    >
      <AppShell.Header />

      <AppShell.Main>
        <Reader path={params().path} />
      </AppShell.Main>
      {/* <AppShell.Footer /> */}
    </AppShell>
  )


}