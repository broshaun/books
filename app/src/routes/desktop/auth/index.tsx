import { createFileRoute } from '@tanstack/solid-router'
import { AuthIndex } from '@/pages/auth'

export const Route = createFileRoute('/desktop/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthIndex/>
}
