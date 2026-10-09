import { type Component, Show } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { IconShieldLock, IconFolderCheck, IconX } from "@tabler/icons-solidjs";
import Dialog from "corvu/dialog";

interface MobilePermissionPromptProps {
  opened: boolean;
  onClose?: () => void;
  onGranted?: (path: string) => void;
}

export const MobilePermissionPrompt: Component<MobilePermissionPromptProps> = (props) => {
  // 唤醒手机系统权限与目录选择
  const handleRequestPermission = async () => {
    try {
      // 唤起系统原生的文件夹/目录选择。
      // 这一步会直接触发 Android/iOS 的系统级权限申请弹窗（如“是否允许应用访问此设备上的照片和媒体/文件”）。
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: "请授予存储读取权限以加载书籍",
      });

      if (selected && typeof selected === "string") {
        console.log("用户已成功授权并选择目录：", selected);
        props.onGranted?.(selected);
        props.onClose?.();
      }
    } catch (error) {
      console.error("唤起系统权限失败，可能已被永久拒绝", error);
    }
  };

  return (
    <Dialog open={props.opened} onOpenChange={(open) => !open && props.onClose?.()}>
      <Dialog.Portal>
        {/* 遮罩层 */}
        <Dialog.Overlay class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" />

        {/* 弹窗主体 */}
        <Dialog.Content class="fixed bottom-0 left-0 right-0 bg-zinc-900 text-zinc-100 border-t border-zinc-800 rounded-t-2xl p-5 flex flex-col items-center gap-4 z-50 outline-none shadow-2xl">
          {/* 关闭按钮 */}
          <div class="w-full flex justify-end">
            <Dialog.Close class="bg-transparent border-none cursor-pointer text-zinc-400 hover:text-zinc-100 p-1">
              <IconX size={20} />
            </Dialog.Close>
          </div>

          {/* 图标与提示 */}
          <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
            <IconShieldLock size={28} />
          </div>

          <div class="text-center space-y-1">
            <h3 class="font-semibold text-base text-zinc-100">需要存储读取权限</h3>
            <p class="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
              为了能够扫描和阅读您手机本地的 .epub 书籍，我们需要获取系统的文件读取授权。
            </p>
          </div>

          {/* 唤醒授权按钮 */}
          <div class="w-full pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRequestPermission}
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20"
            >
              <IconFolderCheck size={18} />
              立即开启授权并选择目录
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
};