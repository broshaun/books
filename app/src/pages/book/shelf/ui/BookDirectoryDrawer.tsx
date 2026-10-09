import { type Component, For, Show, createSignal, onMount } from "solid-js";
import { readDir } from "@tauri-apps/plugin-fs";
import { documentDir, homeDir, join, dirname } from "@tauri-apps/api/path";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import {
  IconFolder,
  IconFolderCog,
  IconUserCircle,
  IconInfoCircle,
  IconArrowBackUp,
  IconCheck,
  IconX,
  IconShieldLock,
  IconFolderCheck,
} from "@tabler/icons-solidjs";
import Dialog from "corvu/dialog";

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
  onSetFolder?: (path: string) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  const [selectorOpen, setSelectorOpen] = createSignal(false);
  const [permissionModalOpen, setPermissionModalOpen] = createSignal(false);

  // 检测是否为移动端环境
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const handleSettingsClick = () => {
    if (isMobile) {
      // 手机端：唤醒独立的权限与文件选择弹窗
      setPermissionModalOpen(true);
    } else {
      // 桌面端：打开原有的文件夹目录选择树
      setSelectorOpen(true);
    }
  };

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

      {/* 2. 抽屉主体 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-[240px] bg-zinc-900 text-zinc-100 shadow-xl flex flex-col p-3 transform transition-transform duration-300 ease-in-out ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 标题 */}
        <div class="flex items-center px-1 pt-2 pb-1">
          <span class="font-semibold text-sm text-zinc-100 tracking-tight">我的书籍</span>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 文件夹列表 */}
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
                  props.onSelectFolder?.(folder);
                  props.onClose?.();
                }}
                class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-left cursor-pointer group"
              >
                <IconFolder size={16} class="text-zinc-400 shrink-0" />
                <span class="text-xs font-medium truncate flex-1 text-zinc-200 group-hover:text-white transition-colors">
                  {folder.name}
                </span>
              </button>
            )}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 底部操作区：设置按钮 */}
        <div class="space-y-1">
          <ActionButton
            icon={<IconFolderCog size={16} class="text-zinc-400" />}
            label="设置"
            onClick={handleSettingsClick}
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

      {/* 3. 桌面端文件夹选择弹窗 */}
      <FolderSelector
        opened={selectorOpen()}
        onClose={() => setSelectorOpen(false)}
        onConfirm={async (path) => {
          console.log("设置文件夹", path);
          props.onSetFolder?.(path);
          setSelectorOpen(false);
        }}
      />

      {/* 4. 手机端独立权限与文件授权唤醒组件 */}
      <MobilePermissionPrompt
        opened={permissionModalOpen()}
        onClose={() => setPermissionModalOpen(false)}
        onGranted={(path) => {
          console.log("手机端授权并获取路径:", path);
          props.onSetFolder?.(path);
          setPermissionModalOpen(false);
        }}
      />
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

// 手机端独立权限与文件选择唤醒组件（适配移动端沙盒限制）
interface MobilePermissionPromptProps {
  opened: boolean;
  onClose?: () => void;
  onGranted?: (path: string) => void;
}

function MobilePermissionPrompt(props: MobilePermissionPromptProps) {
  const handleRequestPermission = async () => {
    try {
      // 移动端采用 directory: false 选择文件，可完美调起系统权限框并获取绝对路径
      const selected = await openDialog({
        directory: false,
        multiple: false,
        filters: [
          {
            name: "Epub Books",
            extensions: ["epub"],
          },
        ],
        title: "请选择并授权一本 .epub 书籍",
      });

      if (selected && typeof selected === "string") {
        props.onGranted?.(selected);
      }
    } catch (error) {
      console.error("唤起手机系统文件选择失败", error);
    }
  };

  return (
    <Dialog open={props.opened} onOpenChange={(open) => !open && props.onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" />

        <Dialog.Content class="fixed bottom-0 left-0 right-0 bg-zinc-900 text-zinc-100 border-t border-zinc-800 rounded-t-2xl p-5 flex flex-col items-center gap-4 z-50 outline-none shadow-2xl">
          <div class="w-full flex justify-end">
            <Dialog.Close class="bg-transparent border-none cursor-pointer text-zinc-400 hover:text-zinc-100 p-1">
              <IconX size={20} />
            </Dialog.Close>
          </div>

          <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
            <IconShieldLock size={28} />
          </div>

          <div class="text-center space-y-1">
            <h3 class="font-semibold text-base text-zinc-100">需要存储读取权限</h3>
            <p class="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
              手机端由于系统安全限制，请点击下方按钮选择您的 .epub 书籍文件以自动获取访问授权。
            </p>
          </div>

          <div class="w-full pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRequestPermission}
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20"
            >
              <IconFolderCheck size={18} />
              选择书籍文件并授权
            </button>
            <button
              type="button"
              onClick={() => props.onClose?.()}
              class="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors cursor-pointer border border-zinc-700/50"
            >
              稍后设置
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

// 文件夹选择器弹窗组件 (桌面端专用)
interface FolderSelectorProps {
  opened: boolean;
  onClose?: () => void;
  onConfirm?: (path: string) => void;
}

function FolderSelector(props: FolderSelectorProps) {
  const [path, setPath] = createSignal("");
  const [entries, setEntries] = createSignal<{ name: string; isDirectory: boolean }[]>([]);

  const loadDir = async (target: string) => {
    if (!target) return;
    try {
      const res = (await readDir(target)) as { name: string; isDirectory: boolean }[];
      setEntries(res.filter((e) => e.isDirectory && !e.name.startsWith(".")));
      setPath(target);
    } catch (e) {
      console.error(`打开目录失败: ${target}`, e);
    }
  };

  onMount(async () => {
    try {
      await loadDir((await documentDir()) || (await homeDir()));
    } catch {}
  });

  const btnStyle =
    "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-lg cursor-pointer font-medium text-xs transition-colors";

  const itemStyle =
    "cursor-pointer px-3 py-2.5 flex items-center gap-2.5 border-b border-zinc-800 transition-colors";

  return (
    <Dialog open={props.opened} onOpenChange={(open) => !open && props.onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50" />

        <Dialog.Content class="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-zinc-900 text-zinc-100 border-t border-zinc-800 rounded-t-2xl p-4 flex flex-col gap-3 z-50 outline-none -webkit-tap-highlight-color:transparent shadow-2xl">
          {/* 标题 */}
          <div class="flex justify-between items-center px-1">
            <span class="font-semibold text-sm text-zinc-100">选择文件夹</span>
            <Dialog.Close class="bg-transparent border-none cursor-pointer text-zinc-400 hover:text-zinc-100 p-1">
              <IconX size={18} />
            </Dialog.Close>
          </div>

          {/* 路径栏 */}
          <div class="text-xs text-zinc-400 bg-zinc-800/80 px-3 py-2 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
            {path()}
          </div>

          {/* 列表 */}
          <div class="flex-1 max-h-[300px] overflow-y-auto border border-zinc-800 rounded-lg -webkit-overflow-scrolling:touch bg-zinc-950/40">
            <ul class="list-none p-0 m-0">
              <li
                class={`${itemStyle} text-zinc-400 bg-zinc-900 hover:bg-zinc-800`}
                onClick={async () => loadDir(await dirname(path()))}
              >
                <IconArrowBackUp size={18} /> <span>..</span>
              </li>
              <For each={entries()}>
                {(e) => (
                  <li
                    class={`${itemStyle} text-zinc-200 hover:bg-zinc-800/60`}
                    onClick={async () => loadDir(await join(path(), e.name))}
                  >
                    <IconFolder size={18} class="text-zinc-400 shrink-0" />
                    <span class="overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-xs">
                      {e.name}
                    </span>
                  </li>
                )}
              </For>
            </ul>
          </div>

          {/* 底部按钮 */}
          <div class="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => props.onClose?.()}
              class={`${btnStyle} bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700`}
            >
              <IconX size={16} /> 取消
            </button>
            <button
              type="button"
              onClick={() => props.onConfirm?.(path())}
              class={`${btnStyle} bg-zinc-100 text-zinc-900 hover:bg-white`}
            >
              <IconCheck size={16} /> 确定
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export default BookDirectoryDrawer;