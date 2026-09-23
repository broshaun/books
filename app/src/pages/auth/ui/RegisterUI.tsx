import { createSignal, Show } from "solid-js";

interface TextFieldProps {
  label?: string;
  hintText?: string;
  value: string;
  onChanged?: (value: string) => void;
  maxWidth?: number;
  obscureText?: boolean;
  disabled?: boolean;
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

      <TextField
        label="账号"
        hintText="请输入账号"
        value={account()}
        disabled={props.loading}
        onChanged={setAccount}
      />

      <TextField
        label="密码"
        hintText="请输入密码"
        obscureText
        value={password()}
        disabled={props.loading}
        onChanged={setPassword}
      />

      {/* 蓝色注册按钮（已对齐 LoginUI 样式） */}
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
    </div>
  );
}

export default RegisterUI;