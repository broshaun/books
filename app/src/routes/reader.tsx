import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { createEffect } from "solid-js";
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { useSafety } from "@/hooks/useSafety";


export const Route = createFileRoute("/reader")({
    component: Layout,
});

function Layout() {
    const { height } = winSize();
    const safety = useSafety();

    createEffect(() => {
        useStore2.setHeight(height);
    });

    return (
        <AppShell
            header={{ height: safety.top() }}
            footer={{ height: safety.bottom() }}
        >
            <AppShell.Header pt={safety.top()} />
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
            <AppShell.Footer pb={safety.bottom()} />
        </AppShell>
    );
}