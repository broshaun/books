import { createSignal, For, Show } from "solid-js";
import Dialog from "corvu/dialog";
import { documentDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, readDir } from "@tauri-apps/plugin-fs";
import {
  IconFolder,
  IconFolderSearch,
  IconUserCircle,
  IconInfoCircle,
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
  onUpdateFolders?: (folders: Folder[]) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

const STORAGE_KEY = "books_root_path";

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [inputPath, setInputPath] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleOpenSettings = async () => {
    try {
      setErrorMessage("");
      const cachedPath = localStorage.getItem(STORAGE_KEY);
      const targetPath = cachedPath || (await join(await documentDir(), "books"));
      setInputPath(targetPath);
      setIsSettingsOpen(true);
    } catch (error) {
      console.error("获取路径失败:", error);
    }
  };

  const handleConfirmPath = async () => {
    const targetPath = inputPath().trim();
    if (!targetPath) return;

    try {
      setErrorMessage("");

      if (!(await exists(targetPath))) {
        await mkdir(targetPath, { recursive: true });
      }

      const entries = await readDir(targetPath);
      const subFolders: Folder[] = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory)
          .map(async (entry, index) => ({
            id: index + 1,
            name: entry.name,
            path: await join(targetPath, entry.name),
          }))
      );

      localStorage.setItem(STORAGE_KEY, targetPath);
      props.onUpdateFolders?.(subFolders);
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("读取目录失败:", error);
      setErrorMessage(`扫描失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const hasBottomActions = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 transition-opacity duration-300 ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-[240px] bg-zinc-900 text-zinc-100 shadow-xl flex flex-col p-3 transform transition-transform duration-300 ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div class="flex items-center px-1 pt-2 pb-1">
          <span class="font-semibold text-sm text-zinc-100 tracking-tight">我的书籍</span>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 文件夹列表 */}
        <div class="flex-1 overflow-auto space-y-0.5">
          <For
            each={props.folders}
            fallback={
              <div class="text-xs text-zinc-400 text-center py-10 select-none">
                暂无子文件夹，请点击下方设置
              </div>
            }
          >
            {(folder) => (
              <button
                type="button"
                onClick={() => {
                  props.onSelectFolder?.(folder);
                  props.onClose?.();
                }}
                class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-left cursor-pointer group"
              >
                <IconFolder size={16} class="text-zinc-400 shrink-0" />
                <span class="text-xs font-medium truncate flex-1 text-zinc-200 group-hover:text-white">
                  {folder.name}
                </span>
              </button>
            )}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 设置按钮 */}
        <div class="space-y-1">
          <ActionButton
            icon={<IconFolderSearch size={16} class="text-zinc-400" />}
            label="设置"
            onClick={handleOpenSettings}
          />
        </div>

        {/* 底部附加操作 */}
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

      {/* 路径设置弹窗 */}
      <Dialog open={isSettingsOpen()} onOpenChange={setIsSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" />
          <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
            <Dialog.Content class="w-full max-w-sm bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-4 shadow-xl space-y-4">
              <Dialog.Label class="font-semibold text-sm">设置 Books 根目录路径</Dialog.Label>
              
              <div class="space-y-1.5">
                <input
                  type="text"
                  value={inputPath()}
                  onInput={(e) => setInputPath(e.currentTarget.value)}
                  placeholder="请输入完整文件夹路径..."
                  class="w-full px-3 py-2 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
                <p class="text-[10px] text-zinc-400">
                  系统将自动读取该路径下的所有子文件夹并展示在左侧列表。
                </p>
                <Show when={errorMessage()}>
                  <p class="text-[11px] text-red-400 mt-1">{errorMessage()}</p>
                </Show>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  class="px-3 py-1.5 rounded-md text-xs hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPath}
                  class="px-3 py-1.5 rounded-md text-xs bg-zinc-100 text-zinc-900 hover:bg-white font-medium transition-colors cursor-pointer"
                >
                  确定
                </button>
              </div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}

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

export default BookDirectoryDrawer;