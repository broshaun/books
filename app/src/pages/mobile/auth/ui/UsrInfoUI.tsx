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
    <div 
      class="w-full h-full min-h-fit flex items-center justify-center p-6 box-border select-none"
      style={{
        ...heightStyle(),
        "background-color": "var(--bg-main)",
        "color": "var(--text-color)",
      }}
    >
      <div class="w-full max-w-sm p-2 flex flex-col gap-5">
        
        {/* 账号信息 */}
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 opacity-90 shadow-2xs"
            style={{
              "background-color": "var(--bg-header)",
              "border-color": "var(--border-color)",
              "color": "var(--text-color)",
            }}
          >
            <IconUser size={22} />
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[11px] font-bold uppercase opacity-50 tracking-wider">当前账号</span>
            <span class="text-sm font-semibold truncate mt-0.5" style={{ color: "inherit" }} title={email()}>{email()}</span>
            <span class="text-[11px] opacity-50 truncate font-mono mt-0.5">ID: {id()}</span>
          </div>
        </div>

        {/* 分割线 */}
        <div class="w-full h-[1px]" style={{ "background-color": "var(--border-color)" }} />

        {/* 按钮区 */}
        <div class="flex flex-col gap-2.5">
          <Show when={props.onDownloadNotes}>
            <button
              type="button"
              disabled={props.isSyncing || downloaded()}
              onClick={handleDownload}
              class={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                downloaded()
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-sky-500/10 text-sky-500 border-sky-500/30 hover:bg-sky-500/20 disabled:opacity-50"
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
              class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:bg-rose-500/20"
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