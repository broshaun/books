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
  onSelectFolder?: (folder: Folder) => void; // 修改此处，返回整个 Folder 对象
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
        class={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-in-out ${
          props.opened
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 2. 抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-zinc-900 shadow-xl flex flex-col p-3 transform transition-transform duration-300 ease-in-out ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 标题 */}
        <div class="flex items-center px-1 pt-3 pb-1">
          <span class="font-semibold text-base text-slate-800 dark:text-slate-100">
            我的书籍
          </span>
        </div>

        <hr class="border-slate-200 dark:border-zinc-800 my-2" />

        {/* 文件夹列表 */}
        <div class="flex-1 overflow-auto space-y-0.5">
          <For
            each={props.folders || []}
            fallback={
              <div class="text-xs text-slate-400 text-center py-10">
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
                  // 传递整个 folder 对象给父组件
                  props.onSelectFolder?.(folder);
                  props.onClose?.();
                }}
                class="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              >
                <Show
                  when={deleteMode()}
                  fallback={<IconFolder size={16} class="text-slate-500 shrink-0" />}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds().includes(folder.id)}
                    readOnly
                    class="pointer-events-none rounded border-slate-300 text-slate-900 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </Show>

                <span class="text-sm truncate flex-1 text-slate-700 dark:text-slate-200">
                  {folder.name}
                </span>
              </button>
            )}
          </For>
        </div>

        <hr class="border-slate-200 dark:border-zinc-800 my-2" />

        {/* 底部操作区 */}
        <div class="space-y-1.5">
          <Show
            when={deleteMode()}
            fallback={
              <>
                <button
                  type="button"
                  onClick={() => props.onAddFolder?.()}
                  class="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <IconFolderPlus size={16} class="text-slate-500" />
                  <span class="text-sm font-medium">添加</span>
                </button>

                <button
                  type="button"
                  disabled={!props.folders?.length}
                  onClick={() => toggleDeleteMode(true)}
                  class="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <IconFolderX size={16} class="text-slate-500" />
                  <span class="text-sm font-medium">移除</span>
                </button>
              </>
            }
          >
            <div class="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!selectedIds().length}
                onClick={handleConfirmDelete}
                class="flex items-center justify-center px-2.5 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm cursor-pointer shadow-sm"
              >
                确认
              </button>
              <button
                type="button"
                onClick={() => toggleDeleteMode(false)}
                class="flex items-center justify-center px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-slate-200 font-medium text-sm cursor-pointer"
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