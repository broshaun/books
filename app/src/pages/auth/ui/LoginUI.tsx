import { createSignal, Show } from "solid-js";

interface LoginSubmitData {
  account: string;
  password: string;
}

interface LoginUIProps {
  loading?: boolean;
  onSubmit: (data: LoginSubmitData) => void;
}

export function LoginUI(props: LoginUIProps) {
  const [account, setAccount] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = () => {
    if (!props.loading) {
      props.onSubmit({ account: account().trim(), password: password() });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputBoxClass = () => 
    `w-full max-w-[250px] rounded-md border border-stone-300 bg-white overflow-hidden flex items-center transition-opacity ${
      props.loading ? "opacity-60 cursor-not-allowed" : "opacity-100"
    }`;

  return (
    <div class="flex flex-col items-center gap-4 w-full text-stone-900">
      <h4 class="text-base font-bold text-stone-900">登录界面</h4>

      <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-stone-300 to-transparent my-1" />

      {/* 账号输入框 */}
      <div class={inputBoxClass()}>
        <div class="px-3 h-10 min-w-[66px] bg-stone-50 border-r border-stone-200 flex items-center justify-center">
          <span class="text-xs font-semibold text-stone-500">账号</span>
        </div>
        <input
          type="text"
          value={account()}
          placeholder="请输入账号"
          disabled={props.loading}
          onInput={(e) => setAccount(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          class="flex-1 px-3 h-10 text-sm bg-transparent border-none outline-none disabled:cursor-not-allowed text-stone-900 placeholder:text-stone-400"
          autocomplete="username"
        />
      </div>

      {/* 密码输入框 */}
      <div class={inputBoxClass()}>
        <div class="px-3 h-10 min-w-[66px] bg-stone-50 border-r border-stone-200 flex items-center justify-center">
          <span class="text-xs font-semibold text-stone-500">密码</span>
        </div>
        <input
          type="password"
          value={password()}
          placeholder="请输入密码"
          disabled={props.loading}
          onInput={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          class="flex-1 px-3 h-10 text-sm bg-transparent border-none outline-none disabled:cursor-not-allowed text-stone-900 placeholder:text-stone-400"
          autocomplete="current-password"
        />
      </div>

      {/* 登录按钮 */}
      <button
        type="button"
        disabled={props.loading}
        onClick={handleSubmit}
        class="w-full max-w-[250px] h-[42px] rounded-lg bg-sky-500 border border-sky-600 text-white font-medium text-sm flex items-center justify-center transition-colors hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        <Show when={props.loading} fallback="登录">
          <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        </Show>
      </button>
    </div>
  );
}

export default LoginUI;