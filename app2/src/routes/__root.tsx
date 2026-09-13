import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { MantineProvider } from "@mantine/core";


export const Route = createRootRouteWithContext()({
  component: () => {
    return (
      <MantineProvider defaultColorScheme="light">
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
      </MantineProvider>
    )
  }
});