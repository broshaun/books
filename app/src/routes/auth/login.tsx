import { createFileRoute } from '@tanstack/solid-router'
import { Login } from '@/pages/auth/login'


export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Login />
}
