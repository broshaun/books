import { createSignal, For, Show } from "solid-js";
import {
  IconFolder,
  IconFolderPlus,
  IconFolderX,
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
  onAddFolder?: () => void;
  onDeleteFolders?: (ids: number[]) => void;
}

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  const [deleteMode, setDeleteMode] = createSignal(false);
  const [selectedIds, setSelectedIds] = createSignal<number[]>([]);

  const toggleDeleteMode = (active: boolean) => {
    setDeleteMode(active);
    if (!active) setSelectedIds([]);
  };

  const toggleFolder = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleConfirmDelete = () => {
    const ids = selectedIds();
    if (!ids.length) return;
    props.onDeleteFolders?.(ids);
    toggleDeleteMode(false);
  };

  return (
    <>
      {/* 1. 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 transition-opacity duration-300 ease-in-out ${
          props.opened
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 2. 抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-zinc-900 text-zinc-100 shadow-xl flex flex-col p-3 transform transition-transform duration-300 ease-in-out ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 标题 */}
        <div class="flex items-center px-1 pt-2 pb-1">
          <span class="font-semibold text-sm text-zinc-100 tracking-tight">
            我的书籍
          </span>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 文件夹列表（改为扁平化菜单列表，无卡片边框与背景） */}
        <div class="flex-1 overflow-auto space-y-0.5">
          <For
            each={props.folders || []}
            fallback={
              <div class="text-xs text-zinc-400 text-center py-10 select-none">
                暂无文件夹
              </div>
            }
          >
            {(folder) => (
              <button
                type="button"
                onClick={() => {
                  if (deleteMode()) {
                    toggleFolder(folder.id);
                    return;
                  }
                  props.onSelectFolder?.(folder);
                  props.onClose?.();
                }}
                class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-left cursor-pointer group"
              >
                <Show
                  when={deleteMode()}
                  fallback={<IconFolder size={16} class="text-zinc-400 shrink-0" />}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds().includes(folder.id)}
                    readOnly
                    class="pointer-events-none rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-0 shrink-0"
                  />
                </Show>

                <span class="text-xs font-medium truncate flex-1 text-zinc-200 group-hover:text-white transition-colors">
                  {folder.name}
                </span>
              </button>
            )}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 底部操作区 */}
        <div class="space-y-1">
          <Show
            when={deleteMode()}
            fallback={
              <>
                <button
                  type="button"
                  onClick={() => props.onAddFolder?.()}
                  class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 hover:text-white cursor-pointer"
                >
                  <IconFolderPlus size={16} class="text-zinc-400" />
                  <span class="text-xs font-medium">添加</span>
                </button>

                <button
                  type="button"
                  disabled={!props.folders?.length}
                  onClick={() => toggleDeleteMode(true)}
                  class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <IconFolderX size={16} class="text-zinc-400" />
                  <span class="text-xs font-medium">移除</span>
                </button>
              </>
            }
          >
            <div class="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!selectedIds().length}
                onClick={handleConfirmDelete}
                class="flex items-center justify-center px-3 py-2 rounded-md bg-zinc-100 text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs cursor-pointer shadow-sm"
              >
                确认
              </button>
              <button
                type="button"
                onClick={() => toggleDeleteMode(false)}
                class="flex items-center justify-center px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 font-medium text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}

export default BookDirectoryDrawer;