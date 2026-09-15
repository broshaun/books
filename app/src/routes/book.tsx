import { createEffect, Show, For, type JSX } from "solid-js";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/solid-router";
import { IconBooks, IconUserCircle, IconHome } from "@tabler/icons-solidjs";
import { appBarStore } from "@/components/appBarStore";
import { AppBar } from "@/components/AppBar";
import { useStore2 } from "@/hooks/useStore2";
import { winSize } from "@/lib/winSize";
import { useSafety } from "@/hooks/useSafety";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/book")({
  component: Layout,
});

interface ItemProps {
  label: string;
  icon: JSX.Element; // 规范类型，告别 any
  onClick?: () => void;
  badge?: boolean | number;
}

function Item(props: ItemProps) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class="flex flex-col items-center justify-center h-full w-full bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
    >
      <div class="relative flex items-center justify-center">
        {props.icon}
        <Show when={props.badge}>
          <span class="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
        </Show>
      </div>
      <span class="text-[10px] mt-1">{props.label}</span>
    </button>
  );
}

function Layout() {
  const navigate = useNavigate();
  const safety = useSafety();
  const { height } = winSize();

  createEffect(() => {
    useStore2.setHeight(height - 100 - safety.bottom - safety.top);
  });

  const visibleItems = [
    {
      key: "home",
      label: "主页",
      icon: <IconHome size={20} />,
      onClick: () => {
        appBarStore.set({ title: "主页" });
        navigate({ to: "/book/shelf" });
      },
    },
    {
      key: "books",
      label: "书架",
      icon: <IconBooks size={20} />,
      onClick: () => {
        appBarStore.set({ title: "书架" });
        navigate({ to: "/book/shelf" });
      },
    },
    {
      key: "self",
      label: "我的",
      icon: <IconUserCircle size={20} />,
      onClick: () => {
        appBarStore.set({ title: "我的" });
      },
    },
  ];

  // return  <Outlet />

  console.log('height',height)

  return (
    <AppShell
      header={{ height: 50 + safety.top }}
      footer={{ height: 50 + safety.bottom }}
    >
      <AppShell.Header pt={50 + safety.top}>
        <AppBar
          title={appBarStore.title}
          left={appBarStore.left}
          right={appBarStore.right}
        />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer pb={50 + safety.bottom}>
        <div class="flex h-full w-full items-center justify-around">
          <For each={visibleItems}>
            {(item) => (
              <div class="flex-1 h-full">
                <Item label={item.label} icon={item.icon} onClick={item.onClick} />
              </div>
            )}
          </For>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}

export default Layout;