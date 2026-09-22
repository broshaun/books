import { createSignal, Show,type JSX } from "solid-js";

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
  const maxWidth = props.maxWidth ?? 250;

  return (
    <div
      class={`w-full rounded-md border border-stone-300 bg-white overflow-hidden flex items-center transition-opacity ${
        props.disabled ? "opacity-60 cursor-not-allowed" : "opacity-100"
      }`}
      style={{ "max-width": `${maxWidth}px` }}
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

interface RegisterSubmitData {
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

  const submit = async (): Promise<void> => {
    await props.onSubmit?.({
      account: account().trim(),
      password: password(),
    });

    setAccount("");
    setPassword("");
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

      <button
        type="button"
        disabled={props.loading}
        onClick={() => void submit()}
        class="w-full max-w-[250px] h-[42px] rounded-lg bg-stone-900 text-white font-medium text-sm flex items-center justify-center transition-colors hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        <Show when={props.loading} fallback="注册">
          <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        </Show>
      </button>
    </div>
  );
}

export default RegisterUI;