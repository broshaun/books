import { createEffect, createSignal } from "solid-js";
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { IconUserCircle, IconUserPlus, IconChevronLeft } from "@tabler/icons-solidjs";
import Burger from "./ui/Burger";
import GlobalModal from "@/components/GlobalModal";



export function Layout() {
    const navigate = useNavigate()
    const safety = useSafety();
    const { height } = winSize();
    createEffect(() => {
        useStore2.setHeight(height - 50 - safety.bottom() - safety.top());
    });



    return (
        <div>
            <GlobalModal />
            <AppShell header={{ height: 50 + safety.top() }}>
                <AppShell.Header pt={50 + safety.top()}>
                    <Burger icon={<IconChevronLeft color="gray" size={25} />} p={20} onClick={() => { navigate({ to: "/book/shelf" }) }} />
                </AppShell.Header>
                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>

            </AppShell>
        </div>
    );
}