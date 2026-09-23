import { For, type JSX } from 'solid-js';
import Drawer from '@corvu/drawer';

export interface DrawerMenuItem {
  key: string;
  display?: boolean;
  icon: JSX.Element;
}

interface DrawerMenuUIProps {
  opened: boolean;
  onClose: () => void;
  menu: DrawerMenuItem[];
}

interface MenuItemProps {
  label: string;
  Icon: any;
  onClick?: () => void;
}

export function MenuItem(props: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors cursor-pointer text-left bg-transparent border-none outline-none"
    >
      <props.Icon size={18} class="text-stone-500 shrink-0" />
      <span>{props.label}</span>
    </button>
  );
}

export const DrawerMenuUI = (props: DrawerMenuUIProps) => {
  return (
    <Drawer
      side="left"
      open={props.opened}
      onOpenChange={(open) => !open && props.onClose()}
    >
      <Drawer.Portal>
        {/* 背景遮罩：将时长改为 500ms，让淡入淡出更舒缓 */}
        <Drawer.Overlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-900 data-[transitioning]:opacity-0" />
        
        {/* 抽屉面板：将时长改为 500ms，配合平滑的贝塞尔曲线，速度变慢且更有高级感 */}
        <Drawer.Content class="fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 shadow-2xl flex flex-col outline-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
          
          <div class="pt-4 pb-2 px-1">
            <h2 class="text-base font-bold text-stone-900 tracking-tight">导航</h2>
            <div class="mt-3 h-px w-full bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
          </div>
          
          <div class="flex flex-col gap-1 mt-2 overflow-y-auto flex-1">
            <For each={props.menu.filter((item) => item.display !== false)}>
              {(item) => item.icon}
            </For>
          </div>
          
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};