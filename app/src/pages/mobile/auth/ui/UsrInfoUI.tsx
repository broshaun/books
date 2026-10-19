import { createSignal, Show } from "solid-js";
import { IconUser, IconLogout, IconCloudDown, IconLoader2, IconCheck } from "@tabler/icons-solidjs";

export interface UserProfileCardProps {
  email?: string;
  id?: string;
  height?: string | number;
  isSyncing?: boolean;
  data?: { email?: string; id?: string; [key: string]: any } | null;
  onLogout?: () => void | Promise<void>;
  onDownloadNotes?: () => void | Promise<void>;
}

export function UsrInfoUI(props: UserProfileCardProps) {
  const [downloaded, setDownloaded] = createSignal(false);

  const email = () => props.data?.email || props.email || "77254@qq.com";
  const id = () => props.data?.id || props.id || "6ab10d9de2faf96af165a351";
  
  // 高度自适应：如果传了具体高度则用传入的，否则自动撑满容器并支持最小高度
  const heightStyle = () => ({ 
    height: typeof props.height === "number" ? `${props.height}px` : props.height || "100%" 
  });

  const handleDownload = async () => {
    if (props.onDownloadNotes && !props.isSyncing && !downloaded()) {
      try {
        await props.onDownloadNotes();
        setDownloaded(true);
      } catch (err) {
        console.error("下载失败:", err);
      }
    }
  };

  return (
    <div class="w-full h-full min-h-fit bg-stone-100 flex items-center justify-center p-6 box-border" style={heightStyle()}>
      <div class="w-full max-w-sm text-stone-800 p-2 flex flex-col gap-5">
        
        {/* 账号信息 */}
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-stone-200/70 flex items-center justify-center shrink-0 text-stone-700">
            <IconUser size={22} />
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[11px] font-bold uppercase text-stone-400">当前账号</span>
            <span class="text-sm font-semibold text-stone-900 truncate mt-0.5" title={email()}>{email()}</span>
            <span class="text-[11px] text-stone-400 truncate font-mono mt-0.5">ID: {id()}</span>
          </div>
        </div>

        <div class="w-full h-[1px] bg-stone-200/80" />

        {/* 按钮区 */}
        <div class="flex flex-col gap-2.5">
          <Show when={props.onDownloadNotes}>
            <button
              type="button"
              disabled={props.isSyncing || downloaded()}
              onClick={handleDownload}
              class={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold border disabled:cursor-not-allowed ${
                downloaded()
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100/60"
                  : "bg-sky-50 text-sky-600 border-sky-100/60 disabled:opacity-60"
              }`}
            >
              <Show when={props.isSyncing} fallback={
                <Show when={downloaded()} fallback={
                  <><IconCloudDown size={16} /><span>下载笔记</span></>
                }>
                  <IconCheck size={16} /><span>下载完成</span>
                </Show>
              }>
                <IconLoader2 size={16} class="animate-spin" /><span>下载中...</span>
              </Show>
            </button>
          </Show>

          <Show when={props.onLogout}>
            <button
              type="button"
              disabled={props.isSyncing}
              onClick={() => props.onLogout?.()}
              class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/60 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <IconLogout size={16} />
              <span>退出账号</span>
            </button>
          </Show>
        </div>

      </div>
    </div>
  );
}

export default UsrInfoUI;