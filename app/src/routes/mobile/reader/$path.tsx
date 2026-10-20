import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";
import { getSafeAreaTop } from '@/lib/getSafeAreaTop';


const safeTopHeight = getSafeAreaTop();


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
      header={{ padding: safeTopHeight }}
      footer={{ height: 0 }}
    >
      <AppShell.Header />
      <AppShell.Main  >
        <Reader path={params().path} />
      </AppShell.Main>

    </AppShell>
  )


}