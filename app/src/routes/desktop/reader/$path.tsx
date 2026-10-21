import Reader from '@/pages/desktop/reader';
import { createFileRoute } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { onMount, onCleanup, createEffect } from "solid-js";
// import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { useTheme } from "@/hooks/useTheme";


export const Route = createFileRoute("/desktop/reader/$path")({
  component: Layout,
});

function Layout() {

  const params = Route.useParams();
  const { setTheme } = useTheme();
  
    createEffect(() => {
      setTheme(useStore2.theme);
    });
  
    onMount(() => {
      onCleanup(() => {
        setTheme('default');
      });
    });

  return (
    <AppShell>
      <AppShell.Main>
        <Reader path={params().path} />
      </AppShell.Main>
    </AppShell>
  );
}

