import { Show } from "solid-js";
import { IconUser, IconLogout } from "@tabler/icons-solidjs";

export interface UserProfileCardProps {
  email?: string;
  id?: string;
  onLogout?: () => void | Promise<void>;
}

export function UserProfileCard(props: UserProfileCardProps) {
  return (
    <div class="w-full max-w-xs bg-zinc-900 text-zinc-100 rounded-xl p-4 shadow-xl flex flex-col gap-4 border border-zinc-800">
      {/* 账号信息区 */}
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
          <IconUser size={20} />
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="text-xs font-medium text-zinc-400">当前账号</span>
          <span class="text-xs font-semibold text-zinc-200 truncate" title={props.email}>
            {props.email || "77254@qq.com"}
          </span>
          <span class="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
            ID: {props.id || "6ab10d9de2faf96af165a351"}
          </span>
        </div>
      </div>

      <hr class="border-zinc-800 my-0" />

      {/* 退出账号按钮 */}
      <Show when={props.onLogout}>
        <button
          type="button"
          onClick={() => props.onLogout?.()}
          class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-xs font-medium cursor-pointer"
        >
          <IconLogout size={16} />
          <span>退出账号</span>
        </button>
      </Show>
    </div>
  );
}

export default UserProfileCard;