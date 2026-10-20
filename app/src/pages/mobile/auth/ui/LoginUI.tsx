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
  onKeyDown?: (e: KeyboardEvent) => void;
}

function TextField(props: TextFieldProps) {
  return (
    <div
      class={`w-full rounded-md border overflow-hidden flex items-center transition-opacity shadow-xs ${
        props.disabled ? "opacity-60 cursor-not-allowed" : "opacity-100"
      }`}
      style={{
        "max-width": `${props.maxWidth ?? 250}px`,
        "background-color": "var(--bg-main)",
        "border-color": "var(--border-color)",
      }}
    >
      <Show when={props.label}>
        <div 
          class="px-3 h-10 min-w-[66px] border-r flex items-center justify-center shrink-0 select-none"
          style={{
            "background-color": "var(--bg-header)",
            "border-color": "var(--border-color)",
            "color": "var(--text-color)",
          }}
        >
          <span class="text-xs font-semibold opacity-80" style={{ color: "inherit" }}>{props.label}</span>
        </div>
      </Show>

      <input
        type={props.obscureText ? "password" : "text"}
        value={props.value}
        placeholder={props.hintText}
        disabled={props.disabled}
        onInput={(e) => props.onChanged?.(e.currentTarget.value)}
        onKeyDown={(e) => props.onKeyDown?.(e)}
        autocomplete={props.autocomplete}
        class="flex-1 px-3 h-10 text-sm bg-transparent border-none outline-none disabled:cursor-not-allowed"
        style={{
          "color": "var(--text-color)",
        }}
      />
    </div>
  );
}

interface LoginSubmitData {
  account: string;
  password: string;
}

interface LoginUIProps {
  loading?: boolean;
  onSubmit: (data: LoginSubmitData) => void;
  toRegister?: () => void;
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

  return (
    <div 
      class="flex flex-col items-center justify-center gap-4 w-full h-full min-h-fit p-6 box-border select-none"
      style={{
        "background-color": "var(--bg-main)",
        "color": "var(--text-color)",
      }}
    >
      <h3 class="text-lg font-bold tracking-tight" style={{ color: "inherit" }}>登录界面</h3>

      {/* 渐变分割线 */}
      <div 
        class="w-full max-w-[250px] h-[1px] my-1" 
        style={{ 
          "background": "linear-gradient(to right, transparent, var(--border-color), transparent)" 
        }} 
      />

      {/* 账号输入框 */}
      <TextField
        label="账号"
        hintText="请输入账号"
        value={account()}
        disabled={props.loading}
        onChanged={setAccount}
        onKeyDown={handleKeyDown}
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
        onKeyDown={handleKeyDown}
        autocomplete="current-password"
      />

      {/* 登录按钮（自动适配全局文字和边框反色/主色） */}
      <button
        type="button"
        disabled={props.loading}
        onClick={handleSubmit}
        class="w-full max-w-[250px] h-[42px] rounded-lg font-medium text-sm flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs border"
        style={{
          "background-color": "var(--text-color)",
          "color": "var(--bg-main)",
          "border-color": "var(--border-color)",
        }}
      >
        <Show when={props.loading} fallback="登录">
          <span 
            class="inline-block animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
            style={{
              "border-color": "var(--bg-main)",
              "border-top-color": "transparent",
            }}
          />
        </Show>
      </button>

      {/* 只有存在 toRegister 回调时才显示 */}
      <Show when={props.toRegister}>
        <div class="text-xs opacity-80 mt-1" style={{ color: "inherit" }}>
          还没有账号？{" "}
          <button
            type="button"
            onClick={() => props.toRegister?.()}
            class="underline cursor-pointer font-medium bg-transparent border-none p-0"
            style={{ color: "inherit" }}
          >
            注册账号
          </button>
        </div>
      </Show>
    </div>
  );
}

export default LoginUI;