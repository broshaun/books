import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/book/desktop/reader';


export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  return <Reader path={params().path}  />

}