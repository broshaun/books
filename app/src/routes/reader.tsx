import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { createEffect } from "solid-js";
import { winSize } from "@/lib/winSize";
import AppGesture from "@/components/AppGesture";


export const Route = createFileRoute("/reader")({
    component: Layout,
});

function Layout() {
    const { height } = winSize();
    createEffect(() => {
        useStore2.setHeight(height);
    });
    return (
        <AppGesture height={height} >
            <Outlet />
        </AppGesture>
    );
}