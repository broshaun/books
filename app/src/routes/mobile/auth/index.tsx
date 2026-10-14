import { createFileRoute } from '@tanstack/solid-router'
import { AuthIndex } from '@/pages/mobile/auth'

export const Route = createFileRoute('/mobile/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthIndex/>
}
