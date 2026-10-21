
import Shelf from '@/pages/desktop/shelf'
import { createFileRoute } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { AppShell } from "@/components/AppShell";


export const Route = createFileRoute('/desktop/shelf/')({
    component: Layout,
})

function Layout() {

    return (
        <AppShell header={{ height: 50, padding: 0 }}>
            <AppShell.Header>
                <AppBar
                    title={appBarStore.title}
                    left={appBarStore.left}
                    right={appBarStore.right}
                    height={50}
                />
            </AppShell.Header>
            <AppShell.Main>
                <Shelf />
            </AppShell.Main>
        </AppShell>
    );
}