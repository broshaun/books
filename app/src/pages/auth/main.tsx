import { createEffect, createSignal } from "solid-js";
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { DrawerMenuUI, MenuItem, type DrawerMenuItem } from "./ui/DrawerMeunUI";
import { IconUserCircle, IconUserPlus } from "@tabler/icons-solidjs";
import Burger from "./ui/Burger";
import GlobalModal from "@/components/GlobalModal";

export function Layout() {
    const navigate = useNavigate()
    const safety = useSafety();
    const { height } = winSize();
    createEffect(() => {
        useStore2.setHeight(height - 50 - safety.bottom - safety.top);
    });
    const [opened, setOpened] = createSignal(false);

    const drawerMenu: DrawerMenuItem[] = [
        {
            key: "login",
            display: true,
            icon: <MenuItem label="登录" Icon={IconUserCircle} onClick={() => { navigate({ to: "/auth/login" }); setOpened(false); }} />
        },
        {
            key: "register",
            display: true,
            icon: <MenuItem label="注册" Icon={IconUserPlus} onClick={() => { navigate({ to: "/auth/register" }); setOpened(false); }} />
        },
    ];



    return (

        <div>
            <GlobalModal />
            <DrawerMenuUI
                opened={opened()}
                onClose={() => setOpened(false)}
                menu={drawerMenu}
            />
            <AppShell header={{ height: 50 + safety.top }}>
                <AppShell.Header pt={50 + safety.top}>
                    <Burger onClick={() => setOpened(p => !p)} color="gray" m="sm" size="sm" />
                </AppShell.Header>

                <AppShell.Main>

                    <Outlet />

                </AppShell.Main>

            </AppShell>
        </div>
    );
}