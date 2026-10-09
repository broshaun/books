import { type Component, For, Show } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import {
  IconFolder,
  IconPlus,
  IconUserCircle,
  IconInfoCircle,
  IconShieldLock,
  IconFolderCheck,
  IconX,
} from "@tabler/icons-solidjs";
import Dialog from "corvu/dialog";

export interface BookItem {
  name: string;
  path: string;
}

export interface MobileBookDrawerProps {
  opened: boolean;
  onClose?: () => void;
  books?: BookItem[];
  onSelectBook?: (book: BookItem) => void;
  onImportBooks?: () => void; // 触发导入或弹出授权选择
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

export function MobileBookDrawer(props: MobileBookDrawerProps) {
  const hasBottomActions = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 1. 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 transition-opacity duration-300 ease-in-out ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 2. 移动端抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-[260px] bg-zinc-900 text-zinc-100 shadow-2xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 标题 */}
        <div class="flex items-center justify-between pt-2 pb-1 px-1">
          <span class="font-semibold text-sm text-zinc-100 tracking-tight">我的手机书架</span>
          <button
            type="button"
            onClick={() => props.onClose?.()}
            class="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer bg-transparent border-none"
          >
            <IconX size={18} />
          </button>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 已导入的书籍列表（手机端以书籍文件为管理核心） */}
        <div class="flex-1 overflow-auto space-y-1">
          <For
            each={props.books || []}
            fallback={
              <div class="text-xs text-zinc-500 text-center py-12 select-none flex flex-col items-center gap-2">
                <IconShieldLock size={24} class="text-zinc-600" />
                <span>暂无导入的书籍</span>
              </div>
            }
          >
            {(book) => (
              <button
                type="button"
                onClick={() => {
                  props.onSelectBook?.(book);
                  props.onClose?.();
                }}
                class="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-left cursor-pointer group"
              >
                <IconFolder size={16} class="text-blue-400 shrink-0" />
                <span class="text-xs font-medium truncate flex-1 text-zinc-200 group-hover:text-white transition-colors">
                  {book.name}
                </span>
              </button>
            )}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 底部操作区：手机端专属“导入/授权”按钮 */}
        <div class="space-y-1">
          <button
            type="button"
            onClick={() => {
              props.onImportBooks?.();
              props.onClose?.();
            }}
            class="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white transition-all text-xs font-medium cursor-pointer shadow-md shadow-blue-900/20"
          >
            <IconPlus size={16} />
            <span>选择并导入书籍</span>
          </button>
        </div>

        {/* 底部附加菜单 */}
        <Show when={hasBottomActions()}>
          <hr class="border-zinc-800 my-2" />
          <div class="space-y-0.5 shrink-0">
            <Show when={props.onOpenProfile}>
              <ActionButton
                icon={<IconUserCircle size={16} class="text-zinc-400" />}
                label="个人"
                onClick={() => {
                  props.onOpenProfile?.();
                  props.onClose?.();
                }}
              />
            </Show>
            <Show when={props.onOpenAbout}>
              <ActionButton
                icon={<IconInfoCircle size={16} class="text-zinc-400" />}
                label="关于"
                onClick={() => {
                  props.onOpenAbout?.();
                  props.onClose?.();
                }}
              />
            </Show>
          </div>
        </Show>
      </div>
    </>
  );
}

// 辅助子组件：抽屉菜单按钮
function ActionButton(props: {
  icon: any;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {props.icon}
      <span class="text-xs font-medium">{props.label}</span>
    </button>
  );
}

export default MobileBookDrawer;