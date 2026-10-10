import { For, Show } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path"; // 用于获取父目录
import {
  IconFolder,
  IconFolderPlus,
  IconUserCircle,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-solidjs";

export interface Folder {
  id: number;
  name: string;
  path: string;
}

export interface BookDirectoryDrawerProps {
  opened: boolean;
  onClose?: () => void;
  folders?: Folder[];
  onSelectFolder?: (folder: Folder) => void;
  onAddFolder?: (path: string) => void;
  onDelFolder?: (path: string) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  // 🌟 修改：通过选择某个 epub 文件来指定并导入其所在的整个文件夹
  const handleOpenFolderDialog = async () => {
    try {
      const selected = await openDialog({
        directory: false, // 设为 false 以选择文件
        multiple: false,
        filters: [{ name: "Epub Books", extensions: ["epub"] }],
        title: "选择任意一本 epub 书籍以导入其所在文件夹",
      });

      if (typeof selected === "string") {
        // 获取该文件所在的父目录路径
        const parentDir = await dirname(selected);
        if (parentDir) {
          props.onAddFolder?.(parentDir);
        }
      }
    } catch (error) {
      console.error("获取文件或父目录失败:", error);
    }
  };

  const hasBottomActions = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 1. 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 transition-opacity duration-300 ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 2. 抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-[240px] bg-zinc-900 text-zinc-100 shadow-xl flex flex-col p-3 transform transition-transform duration-300 ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 标题 */}
        <div class="px-1 pt-2 pb-1 font-semibold text-sm text-zinc-100 tracking-tight">我的书籍</div>

        <hr class="border-zinc-800 my-2" />

        {/* 文件夹列表 */}
        <div class="flex-1 overflow-auto space-y-0.5">
          <For
            each={props.folders || []}
            fallback={<div class="text-xs text-zinc-400 text-center py-10 select-none">暂无文件夹</div>}
          >
            {(folder) => (
              <div class="flex items-center group w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors">
                <button
                  type="button"
                  onClick={() => {
                    props.onSelectFolder?.(folder);
                    props.onClose?.();
                  }}
                  class="flex items-center gap-2.5 flex-1 text-left cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                >
                  <IconFolder size={16} class="text-zinc-400 shrink-0" />
                  <span class="text-xs font-medium truncate text-zinc-200 group-hover:text-white transition-colors">
                    {folder.name}
                  </span>
                </button>
                <button
                  type="button"
                  title="移除此目录"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onDelFolder?.(folder.path);
                  }}
                  class="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-transparent border-none shrink-0"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            )}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 底部操作区 */}
        <div class="space-y-1">
          <ActionButton
            icon={<IconFolderPlus size={16} class="text-zinc-400" />}
            label="添加文件夹"
            onClick={handleOpenFolderDialog}
          />
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

// 辅助菜单按钮组件
function ActionButton(props: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 hover:text-white cursor-pointer bg-transparent border-none"
    >
      {props.icon}
      <span class="text-xs font-medium">{props.label}</span>
    </button>
  );
}

export default BookDirectoryDrawer;