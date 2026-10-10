import { createFileRoute } from '@tanstack/solid-router'
import { Register } from '@/pages/auth/register'


export const Route = createFileRoute('/desktop/auth/register')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Register />
}
