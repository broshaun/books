import { createEffect } from "solid-js";
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { AppShell } from "@/components/AppShell";
import { IconChevronLeft } from "@tabler/icons-solidjs";
import GlobalModal from "@/components/GlobalModal";
import { FloatingButton } from "@/components/FloatingButton";



export function Layout() {
    const navigate = useNavigate()
    const { height, width } = winSize();

    createEffect(() => {
        useStore2.setHeight(height);
        useStore2.setWidth(width)
    });

    return (
        <div>
            <GlobalModal />
            <AppShell>
                <AppShell.Header />
                <AppShell.Main >
                    <FloatingButton icon={<IconChevronLeft color="gray" size={25} />} initialX={16} initialY={16} onClick={() => { navigate({ to: "/mobile/shelf" }) }} />
                    <Outlet />
                </AppShell.Main>

            </AppShell>
        </div>
    );
}