import { createFileRoute } from '@tanstack/solid-router'
import { useNavigate } from '@tanstack/solid-router';
import { apiConfig } from '@/config';
import { onMount } from 'solid-js';
import VConsole from 'vconsole';

// 仅在开发环境或按需开启
if (import.meta.env.DEV) {
  new VConsole();
}

export const Route = createFileRoute('/')({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = useNavigate()
  
  const isIPad = /iPad/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isMobile = isIPad || isIPhone || isAndroid;

  console.log('apiBase: ', apiConfig.apiBase);
  console.log('apiMqtt: ', apiConfig.apiMqtt);
  console.log('apiImgs: ', apiConfig.apiImgs);
  console.log('apiImg30: ', apiConfig.apiImg30);
  console.log('apiAvatar: ', apiConfig.apiAvatar);

  onMount(() => {
    if (!isMobile) {
      return navigate({ to: "/mobile/shelf" });
    } else {
      return navigate({ to: "/desktop/shelf" });
    }
  })


  return (
    <div class="h-screen grid place-items-center">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}
