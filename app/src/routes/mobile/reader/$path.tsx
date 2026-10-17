import { createFileRoute } from '@tanstack/solid-router'
import Reader from '@/pages/mobile/reader';
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import { createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";


export const Route = createFileRoute('/mobile/reader/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams();
  const safety = useSafety();
  const { height, width } = winSize();

  createEffect(() => {
    useStore2.setHeight(height);
    useStore2.setWidth(width)
  });

  return (
    <AppShell
      header={{ padding: 0 }}
      // navbar={{ padding: safety.top() }}
      // aside={{ padding: safety.bottom() }}
      footer={{ height: 0 }}
    >
      <AppShell.Header />

      <AppShell.Main
        ref={(el) => {
          // requestAnimationFrame(() => {
          //   useStore2.setHeight(el.clientHeight);
          //   useStore2.setWidth(el.clientWidth);

          // });
        }}
      >
        <Reader path={params().path} />
      </AppShell.Main>
      {/* <AppShell.Footer /> */}
    </AppShell>
  )


}