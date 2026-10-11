import { createFileRoute } from '@tanstack/solid-router'
import { Register } from '@/pages/desktop/auth/register'


export const Route = createFileRoute('/desktop/auth/register')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Register />
}
