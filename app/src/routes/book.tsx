import { createEffect } from "solid-js";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";
import AppGesture from "@/components/AppGesture";
import { useAppGesture } from "@/hooks/useAppGesture";

export const Route = createFileRoute("/book")({
  component: Layout,
});

function Layout() {
  const navigate = useNavigate();
  const safety = useSafety();
  const { height } = winSize();

  createEffect(() => {
    useStore2.setHeight(height - 50 - safety.bottom - safety.top);
  });

const [gestureStatus, setGestureStatus] = createSignal('等待手势滑动...');

  // 使用封装好的 hook 监听全局手势事件
  useAppGesture({
    onLeftSwipeRight: (e) => {
      console.log('👈 在其他地方收到了左侧右滑回调', e);
      setGestureStatus('👈 触发了：左侧向右滑');
    },
    onRightSwipeLeft: (e) => {
      console.log('👉 在其他地方收到了右侧左滑回调', e);
      setGestureStatus('👉 触发了：右侧向左滑');
    },
    onTopSwipeBottom: (e) => {
      console.log('👇 收到自上往下滑动回调', e);
      setGestureStatus('👇 触发了：自上往下滑');
    },
    onBottomSwipeTop: (e) => {
      console.log('👆 收到自下往上滑动回调', e);
      setGestureStatus('👆 触发了：自下往上滑');
    },
  });
  

  return (
    <AppShell header={{ height: 50 + safety.top }}>
      <AppShell.Header pt={50 + safety.top}>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
          theme="zinc"
        />
      </AppShell.Header>

      <AppShell.Main>
        <AppGesture height={height} class="bg-red-500/20" >
          {/* <Outlet /> */}
          <div>123</div>
        </AppGesture>

      </AppShell.Main>

    </AppShell>
  );
}