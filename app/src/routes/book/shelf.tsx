import { createFileRoute } from '@tanstack/solid-router'
import { Index } from '@/pages/book/shelf'


export const Route = createFileRoute('/book/shelf')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Index/>
}
