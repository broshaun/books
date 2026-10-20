import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";
import { useSafeArea } from '@/hooks/useSafeArea';


export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  const { height, width } = winSize();
  const safely = useSafeArea();

  createEffect(() => {
    useStore2.setHeight(height);
    useStore2.setWidth(width)
  });

  return (
    <AppShell
      header={{ padding: safely().top }}
      footer={{ padding: safely().bottom }}
      navbar={{ padding: safely().left }}
      aside={{ padding: safely().right }}
    >
      <AppShell.Header />
      <AppShell.Main  >
        <Reader path={params().path} />
      </AppShell.Main>

    </AppShell>
  )


}