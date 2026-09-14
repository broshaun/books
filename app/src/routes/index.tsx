import { createFileRoute } from '@tanstack/solid-router'
import { useNavigate } from '@tanstack/solid-router';
import { apiConfig } from '@/config';
import { onMount } from 'solid-js';



export const Route = createFileRoute('/')({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = useNavigate()
  console.log('apiBase: ', apiConfig.apiBase);
  console.log('apiMqtt: ', apiConfig.apiMqtt);
  console.log('apiImgs: ', apiConfig.apiImgs);
  console.log('apiImg30: ', apiConfig.apiImg30);
  console.log('apiAvatar: ', apiConfig.apiAvatar);

  onMount(() => {
    console.log('++++')
    navigate({ to: "/book/shelf" });
  })

  return (
    <div class="h-screen grid place-items-center">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}
