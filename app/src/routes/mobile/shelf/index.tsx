import Shelf from '@/pages/mobile/shelf'
import { createFileRoute } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { AppShell } from "@/components/AppShell";
import { useSafeArea } from '@/hooks/useSafeArea';


export const Route = createFileRoute('/mobile/shelf/')({
  component: RouteComponent,
})

function RouteComponent() {
  const safely = useSafeArea();

  return (
    <AppShell
      header={{ height: 50, padding: safely().top }}
      footer={{ height: 0, padding: safely().bottom }}
      navbar={{ padding: safely().left }}
      aside={{ padding: safely().right }}
    >
      <AppShell.Header>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
          height={45}
        />
      </AppShell.Header>
      <AppShell.Main >
        <Shelf />
      </AppShell.Main>
    </AppShell>
  )


}
