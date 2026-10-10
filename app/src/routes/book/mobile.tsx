import { createFileRoute } from '@tanstack/solid-router'
import Shelf from '@/pages/book/shelf/mobile'


export const Route = createFileRoute('/book/mobile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Shelf/>
}
