import { createRootRouteWithContext, Outlet } from '@tanstack/solid-router';



export const Route = createRootRouteWithContext()({
    component: () => {
        return (
            <Outlet />
        )
    }
});