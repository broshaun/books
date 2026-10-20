import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { createEffect, Show } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";
import { TopBarOccluder } from '@/components/TopBarOccluder';

const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);


export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  const { height, width } = winSize();

  createEffect(() => {
    useStore2.setHeight(height);
    useStore2.setWidth(width)
  });

  return (
    <AppShell
      header={{ padding: 0 }}
      footer={{ height: 0 }}
    >
      <Show when={isAndroid}>
        <TopBarOccluder />
      </Show>
      <AppShell.Header />

      <AppShell.Main  >
        <Reader path={params().path} />
      </AppShell.Main>
      {/* <AppShell.Footer /> */}
    </AppShell>
  )


}