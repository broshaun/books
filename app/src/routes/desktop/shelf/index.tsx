
import Shelf from '@/pages/desktop/shelf'
// import { createEffect } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
// import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";


export const Route = createFileRoute('/desktop/shelf/')({
    component: Layout,
})



function Layout() {

    // const { height } = winSize();

    // createEffect(() => {
    //     useStore2.setHeight(height - 50);
    // });

    return (
        <AppShell header={{ height: 50 }}>
            <AppShell.Header>
                <AppBar
                    title={appBarStore.title}
                    left={appBarStore.left}
                    right={appBarStore.right}
                    theme="zinc"
                />
            </AppShell.Header>
            <AppShell.Main
                ref={(el) => {
                    requestAnimationFrame(() => { useStore2.setHeight(el.clientHeight) });
                }}
            >
                <Shelf />
            </AppShell.Main>
        </AppShell>
    );
}