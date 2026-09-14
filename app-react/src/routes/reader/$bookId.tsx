import { createFileRoute } from '@tanstack/react-router'
import Reader from '@/pages/reader'


export const Route = createFileRoute('/reader/$bookId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { bookId } = Route.useParams();
  return <Reader bookId={bookId}  />

}