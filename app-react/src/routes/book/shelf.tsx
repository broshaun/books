import { createFileRoute } from '@tanstack/react-router'
import { Index } from '@/pages/book/shelf'


export const Route = createFileRoute('/book/shelf')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Index/>
}
