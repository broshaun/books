import { createSignal, Show } from "solid-js";

interface TextFieldProps {
  label?: string;
  hintText?: string;
  value: string;
  onChanged?: (value: string) => void;
  maxWidth?: number;
  obscureText?: boolean;
  disabled?: boolean;
  autocomplete?: string;
}

function TextField(props: TextFieldProps) {
  return (
    <div
      class={`w-full rounded-md border border-stone-300 bg-white overflow-hidden flex items-center transition-opacity ${
        props.disabled ? "opacity-60 cursor-not-allowed" : "opacity-100"
      }`}
      style={{ "max-width": `${props.maxWidth ?? 250}px` }}
    >
      <Show when={props.label}>
        <div class="px-3 h-10 min-w-[66px] bg-stone-50 border-r border-stone-200 flex items-center justify-center shrink-0">
          <span class="text-xs font-semibold text-stone-500">{props.label}</span>
        </div>
      </Show>

      <input
        type={props.obscureText ? "password" : "text"}
        value={props.value}
        placeholder={props.hintText}
        disabled={props.disabled}
        onInput={(e) => props.onChanged?.(e.currentTarget.value)}
        autocomplete={props.autocomplete}
        class="flex-1 px-3 h-10 text-sm bg-transparent border-none outline-none disabled:cursor-not-allowed text-stone-900 placeholder:text-stone-400"
      />
    </div>
  );
}

export interface RegisterSubmitData {
  account: string;
  password: string;
}

interface RegisterUIProps {
  loading?: boolean;
  onSubmit?: (data: RegisterSubmitData) => void | Promise<void>;
  toLogin?: () => void; // 统一规范：跳转登录回调
}

export function RegisterUI(props: RegisterUIProps) {
  const [account, setAccount] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async () => {
    if (props.loading) return;
    await props.onSubmit?.({
      account: account().trim(),
      password: password(),
    });
  };

  return (
    <div class="flex flex-col items-center gap-4 w-full text-stone-900">
      <h3 class="text-lg font-bold text-stone-900">注册账号</h3>

      {/* 分割线 */}
      <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-stone-300 to-transparent my-1" />

      {/* 账号输入框 */}
      <TextField
        label="账号"
        hintText="请输入账号"
        value={account()}
        disabled={props.loading}
        onChanged={setAccount}
        autocomplete="username"
      />

      {/* 密码输入框 */}
      <TextField
        label="密码"
        hintText="请输入密码"
        obscureText
        value={password()}
        disabled={props.loading}
        onChanged={setPassword}
        autocomplete="new-password"
      />

      {/* 蓝色注册按钮 */}
      <button
        type="button"
        disabled={props.loading}
        onClick={handleSubmit}
        class="w-full max-w-[250px] h-[42px] rounded-lg bg-sky-500 border border-sky-600 text-white font-medium text-sm flex items-center justify-center transition-colors hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        <Show when={props.loading} fallback="注册">
          <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        </Show>
      </button>

      {/* 只有存在 toLogin 回调时才显示 */}
      <Show when={props.toLogin}>
        <div class="text-sm text-stone-600 mt-1">
          已有账号？{" "}
          <button
            type="button"
            onClick={() => props.toLogin?.()}
            class="text-sky-600 hover:text-sky-700 underline cursor-pointer font-medium"
          >
            登录
          </button>
        </div>
      </Show>
    </div>
  );
}

export default RegisterUI;