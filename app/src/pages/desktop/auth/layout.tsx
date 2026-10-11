import { createEffect } from "solid-js";
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { IconChevronLeft } from "@tabler/icons-solidjs";
import Burger from "./ui/Burger";
import GlobalModal from "@/components/GlobalModal";


export function Layout() {
    const navigate = useNavigate()
    const { height } = winSize();
    createEffect(() => {
        useStore2.setHeight(height - 50);
    });

    return (
        <div>
            <GlobalModal />
            <AppShell header={{ height: 50 }}>
                <AppShell.Header pt={50}>
                    <Burger icon={<IconChevronLeft color="gray" size={25} />} p={20} onClick={() => { navigate({ to: "/desktop/shelf" }) }} />
                </AppShell.Header>
                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>

            </AppShell>
        </div>
    );
}