import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { AppShell } from "@/components/AppShell";
import { onMount, onCleanup, createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";
import { useSafeArea } from '@/hooks/useSafeArea';
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  const safely = useSafeArea();
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
    <AppShell
      header={{ padding: safely().top }}
      footer={{ padding: safely().bottom }}
      navbar={{ padding: safely().left }}
      aside={{ padding: safely().right }}
    >
      <AppShell.Header />
      <AppShell.Main>
        <Reader path={params().path} />
      </AppShell.Main>
    </AppShell>
  )
}