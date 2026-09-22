
import { Outlet, useNavigate } from "@tanstack/solid-router";
import { IconUserCircle, IconUserPlus } from "@tabler/icons-solidjs";
import { Stack, Drawer, Title, AppShell, Burger, Divider, Button } from "@mantine/core";
import { useBoolean } from "ahooks";


interface DemoProps {
    label: string;
    Icon: React.ComponentType<{ size?: number | string }>;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Demo({ label, Icon, onClick }: DemoProps) {
    return (
        <Button leftSection={<Icon size={16} />} variant="transparent" color="gray" onClick={onClick}> {label} </Button>
    );
}

export const Layout = () => {
    const navigate = useNavigate();
    const [opened, { setTrue: open, setFalse: close }] = useBoolean(false);

    const drawerMenu = [
        { key: "login", display: true, icon: <Demo label="登录" Icon={IconUserCircle} onClick={() => { navigate({ 'to': "/web/auth/login" }); close(); }} /> },
        { key: "register", display: true, icon: <Demo label="注册" Icon={IconUserPlus} onClick={() => { navigate({ 'to': "/web/auth/register" }); close(); }} /> },
    ];

    return (
        <React.Fragment>
            <Drawer opened={opened} onClose={close} size={120} withCloseButton={false}   >
                <Title pt={25} order={4} mb="md">导航</Title>
                <Divider mb="md"
                    styles={{
                        root: {
                            border: 'none',
                            height: '1px',
                            backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.15), rgba(255,255,255,0.15)) 20%, transparent)'
                        }
                    }}
                />
                <Stack gap={10}>{drawerMenu.filter(i => i.display !== false).map((item) => (<React.Fragment key={item.key}>{item.icon}</React.Fragment>))}</Stack>
            </Drawer>
            <AppShell
                padding={10}
                header={{ height: 55 }}
            >
                <AppShell.Header>
                    <Burger onClick={open} color="gray" m="sm" size="sm" />
                </AppShell.Header >

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>
                <AppShell.Footer />
            </AppShell>
        </React.Fragment>
    );
};