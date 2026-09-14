import { createSignal, For, Show } from "solid-js";
import {
  IconBooks,
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
  onSelectFolder?: (path: string) => void;
  onAddFolder?: () => void;
  onDeleteFolders?: (ids: number[]) => void;
}

export default function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  const [deleteMode, setDeleteMode] = createSignal(false);
  const [selectedIds, setSelectedIds] = createSignal<number[]>([]);

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
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const handleCancelDelete = () => {
    setSelectedIds([]);
    setDeleteMode(false);
  };

  return (
    <Show when={props.opened}>
      {/* 遮罩层 */}
      <div
        class="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={() => props.onClose?.()}
      />

      {/* 抽屉主体 */}
      <div class="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-zinc-900 shadow-xl flex flex-col p-4">
        {/* 标题 */}
        <div class="flex items-center gap-2 mb-3">
          <IconBooks size={20} class="text-slate-700 dark:text-slate-300" />
          <span class="font-semibold text-lg text-slate-800 dark:text-slate-100">
            我的书籍
          </span>
        </div>

        <hr class="border-slate-200 dark:border-zinc-800 mb-4" />

        {/* 文件夹列表 */}
        <div class="flex-1 overflow-auto space-y-1">
          <For
            each={props.folders || []}
            fallback={
              <div class="text-xs text-slate-400 text-center py-12">
                暂无文件夹
              </div>
            }
          >
            {(folder) => {
              const isChecked = () => selectedIds().includes(folder.id);

              return (
                <button
                  type="button"
                  onClick={() => {
                    if (deleteMode()) {
                      toggleFolder(folder.id);
                      return;
                    }
                    props.onSelectFolder?.(folder.path);
                    props.onClose?.();
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <Show
                    when={deleteMode()}
                    fallback={<IconFolder size={16} class="text-slate-500" />}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked()}
                      readOnly
                      class="pointer-events-none rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Show>

                  <span class="text-sm truncate flex-1 text-slate-700 dark:text-slate-200">
                    {folder.name}
                  </span>
                </button>
              );
            }}
          </For>
        </div>

        <hr class="border-slate-200 dark:border-zinc-800 my-4" />

        {/* 底部操作区 */}
        <div class="space-y-2">
          <Show
            when={deleteMode()}
            fallback={
              <>
                <button
                  type="button"
                  onClick={() => props.onAddFolder?.()}
                  class="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-blue-500"
                >
                  <IconFolderPlus size={18} />
                  <span class="text-sm font-medium">添加</span>
                </button>

                <button
                  type="button"
                  disabled={!props.folders?.length}
                  onClick={() => setDeleteMode(true)}
                  class="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IconFolderX size={18} />
                  <span class="text-sm font-medium">移除</span>
                </button>
              </>
            }
          >
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!selectedIds().length}
                onClick={handleConfirmDelete}
                class="flex items-center justify-center px-3 py-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-green-600 font-medium text-sm"
              >
                确认
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                class="flex items-center justify-center px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600 font-medium text-sm"
              >
                取消
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}


export { BookDirectoryDrawer };