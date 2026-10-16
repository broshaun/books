// import { createEffect } from "solid-js";
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
// import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { IconChevronLeft } from "@tabler/icons-solidjs";
import Burger from "./ui/Burger";
import GlobalModal from "@/components/GlobalModal";



export function Layout() {
    const navigate = useNavigate()
    const safety = useSafety();
    // const { height } = winSize();
    // createEffect(() => {
    //     useStore2.setHeight(height - 50 );
    // });

    return (
        <div>
            <GlobalModal />
            <AppShell
                header={{ padding: 30, height: 50 }}
                navbar={{ padding: safety.top() }}
                aside={{ padding: safety.bottom() }}
                footer={{ height: 0 }}
            >
                <AppShell.Header >
                    <Burger icon={<IconChevronLeft color="gray" size={25} />} p={20} onClick={() => { navigate({ to: "/mobile/shelf" }) }} />
                </AppShell.Header>
                <AppShell.Main
                    ref={(el) => {
                        requestAnimationFrame(() => { useStore2.setHeight(el.clientHeight) });
                    }}
                >
                    <Outlet />
                </AppShell.Main>

            </AppShell>
        </div>
    );
}