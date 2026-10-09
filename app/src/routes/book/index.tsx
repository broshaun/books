import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { onMount } from 'solid-js';

export const Route = createFileRoute('/book/')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


    onMount(() => {

        if (isMobile) {
            return navigate({ to: "/book/shelf" });
        } else {
            return navigate({ to: "/book/desktop" });
        }

    })




    return (
        <div class="h-screen grid place-items-center">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
    )
}
