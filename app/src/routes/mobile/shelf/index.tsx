import { createFileRoute } from '@tanstack/solid-router'
import Shelf from '@/pages/mobile/shelf'


export const Route = createFileRoute('/mobile/shelf/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Shelf/>
}
