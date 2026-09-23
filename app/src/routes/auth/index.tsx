import { createFileRoute } from '@tanstack/solid-router'
import { AuthIndex } from '@/pages/auth'

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthIndex/>
}
