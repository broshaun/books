import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/book/reader';


export const Route = createFileRoute('/reader/$bookId')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  return <Reader bookId={params().bookId}  />

}