import { For, Show } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
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
  // 💡 直接通过目录选择器选择子文件夹或任意文件夹
  const handleOpenFolderDialog = async () => {
    try {
      const selected = await openDialog({
        directory: true, // 设为 true 以直接选择文件夹/子文件夹
        multiple: false,
        title: "选择书籍子文件夹",
      });

      if (typeof selected === "string") {
        props.onAddFolder?.(selected);
      }
    } catch (error) {
      console.error("选择文件夹失败:", error);
    }
  };

  const hasBottomActions = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 1. 遮罩层：提供自然柔和的暗色毛玻璃遮罩 */}
      <div
        class={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => props.onClose?.()}
      />

      {/* 2. 抽屉主体：完美融合全局主题背景、文本颜色、边框与立体阴影 */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-full max-w-[240px] border-r shadow-2xl flex flex-col p-3 transform transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          "background-color": "var(--bg-surface)",
          "color": "var(--text-main)",
          "border-color": "var(--border-color)",
          "box-shadow": "var(--shadow-lg)",
        }}
      >
        {/* 标题 */}
        <div 
          class="px-1 pt-2 pb-1 font-semibold text-sm tracking-tight select-none"
          style={{ color: "var(--text-title)" }}
        >
          我的书籍
        </div>

        <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />

        {/* 文件夹列表 */}
        <div class="flex-1 overflow-y-auto space-y-0.5">
          <For
            each={props.folders || []}
            fallback={
              <div 
                class="text-xs text-center py-10 select-none"
                style={{ color: "var(--text-secondary)" }}
              >
                暂无文件夹
              </div>
            }
          >
            {(folder) => (
              <div 
                class="flex items-center group w-full px-2.5 py-2 rounded-md transition-colors cursor-pointer"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <button
                  type="button"
                  onClick={() => {
                    props.onSelectFolder?.(folder);
                    props.onClose?.();
                  }}
                  class="flex items-center gap-2.5 flex-1 text-left cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                >
                  <IconFolder size={16} class="shrink-0 transition-colors" style={{ color: "var(--text-secondary)" }} />
                  <span 
                    class="text-xs font-medium truncate transition-colors"
                    style={{ color: "var(--text-main)" }}
                  >
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
                  class="p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-transparent border-none shrink-0 hover:text-red-500"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            )}
          </For>
        </div>

        <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />

        {/* 底部操作区 */}
        <div class="space-y-1 shrink-0">
          <ActionButton
            icon={<IconFolderPlus size={16} style={{ color: "var(--text-secondary)" }} />}
            label="添加子文件夹"
            onClick={handleOpenFolderDialog}
          />
        </div>

        {/* 底部附加菜单 */}
        <Show when={hasBottomActions()}>
          <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />
          <div class="space-y-0.5 shrink-0">
            <Show when={props.onOpenProfile}>
              <ActionButton
                icon={<IconUserCircle size={16} style={{ color: "var(--text-secondary)" }} />}
                label="个人"
                onClick={() => {
                  props.onOpenProfile?.();
                  props.onClose?.();
                }}
              />
            </Show>
            <Show when={props.onOpenAbout}>
              <ActionButton
                icon={<IconInfoCircle size={16} style={{ color: "var(--text-secondary)" }} />}
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

// 辅助菜单按钮组件（适配通用 `--bg-button-hover` 与主题文字）
function ActionButton(props: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md transition-colors cursor-pointer bg-transparent border-none"
      style={{ color: "var(--text-main)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {props.icon}
      <span class="text-xs font-medium">{props.label}</span>
    </button>
  );
}

export default BookDirectoryDrawer;