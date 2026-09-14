import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { apiConfig } from '@/config';



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

  useEffect(() => {
    console.log('++++')
    navigate({ to: "/book" });
  }, [])

  return (
    <div className="h-screen grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}
