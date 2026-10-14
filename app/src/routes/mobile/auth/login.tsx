import { createFileRoute } from '@tanstack/solid-router'
import { Login } from '@/pages/mobile/auth/login'


export const Route = createFileRoute('/mobile/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Login />
}
