import Reader from '@/pages/desktop/reader';
import { createFileRoute } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { createEffect } from "solid-js";
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";



export const Route = createFileRoute("/desktop/reader/$path")({
  component: Layout,
});

function Layout() {
  const { height } = winSize();



  createEffect(() => {
    useStore2.setHeight(height);
  });
  const params = Route.useParams();

  return (
    <AppShell>
      <AppShell.Header />
      <AppShell.Main>
        <Reader path={params().path} />
      </AppShell.Main>
      <AppShell.Footer />
    </AppShell>
  );
}

