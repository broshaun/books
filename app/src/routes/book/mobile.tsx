import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/book/mobile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/book/mobile"!</div>
}
