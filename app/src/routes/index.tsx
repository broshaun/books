import { createFileRoute } from '@tanstack/solid-router'
import { useNavigate } from '@tanstack/solid-router';
import { apiConfig } from '@/config';
import { createResource } from 'solid-js';
import { hasSafetyConfig } from '@/hooks/useSafety';
import { useSafety } from '@/hooks/useSafety';
import { safetyCache } from '@/api/cache/safetyCache';

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


  const { setTop, setBottom } = useSafety()


  createResource(async () => {
    if (hasSafetyConfig()) {
      return navigate({ to: "/book/shelf" });
    }
    try {
      const data = await safetyCache.get();
      if (data) {
        setTop(data.top);
        setBottom(data.bottom);
        navigate({ to: "/book/shelf" });
      }
    } catch (err) {
      console.error("加载安全配置失败", err);
      navigate({ to: "/safety" });
    }
  })


  return (
    <div class="h-screen grid place-items-center">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}
