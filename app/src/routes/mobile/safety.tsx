import { createFileRoute } from "@tanstack/solid-router";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { Safety } from "@/components/Safety";
import { safetyCache } from "@/api/cache/safetyCache";
import { useNavigate } from "@tanstack/solid-router";


export const Route = createFileRoute("/mobile/safety")({
    component: Layout,
});

function Layout() {
    const navigate = useNavigate()
    const safety = useSafety();

    return (
        <AppShell
            header={{ height: safety.top() }}
            footer={{ height: safety.bottom() }}
        >
            <AppShell.Header pt={safety.top()} />
            <AppShell.Main>
                <Safety onConfirm={async ({ top, bottom }) => {
                    safety.setBottom(bottom);
                    safety.setTop(top);
                    await safetyCache.set({ top, bottom })
                    navigate({ to: "/mobile/shelf" })
                }} />
            </AppShell.Main>
            <AppShell.Footer pb={safety.bottom()} />
        </AppShell>
    );
}