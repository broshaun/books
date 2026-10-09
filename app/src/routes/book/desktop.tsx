import { createFileRoute } from '@tanstack/solid-router'
import Shelf from '@/pages/book/shelf/desktop'


export const Route = createFileRoute('/book/desktop')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Shelf />
}
