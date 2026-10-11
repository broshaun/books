import { createFileRoute } from '@tanstack/solid-router'
import { Login } from '@/pages/desktop/auth/login'


export const Route = createFileRoute('/desktop/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Login />
}
