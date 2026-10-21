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
      class={`w-full rounded-md border overflow-hidden flex items-center transition-all shadow-xs ${
        props.disabled ? "opacity-60 cursor-not-allowed" : "opacity-100"
      }`}
      style={{
        "max-width": `${props.maxWidth ?? 250}px`,
        /* 💡 输入框卡片统一使用全新的 --bg-input */
        "background-color": "var(--bg-input)",
        "border-color": "var(--border-color)",
      }}
    >
      <Show when={props.label}>
        <div 
          class="px-3 h-10 min-w-[66px] border-r flex items-center justify-center shrink-0 select-none"
          style={{
            "background-color": "var(--bg-surface)",
            "border-color": "var(--border-color)",
            "color": "var(--text-main)",
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
          "color": "var(--text-main)",
        }}
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
  toLogin?: () => void;
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div 
      class="flex flex-col items-center justify-center gap-4 w-full h-full min-h-fit p-6 box-border select-none transition-colors"
      style={{
        "background-color": "var(--bg-main)",
        "color": "var(--text-main)",
      }}
    >
      {/* 💡 标题统一采用 --text-title 变量 */}
      <h3 
        class="text-lg font-bold tracking-tight" 
        style={{ color: "var(--text-title)" }}
      >
        注册账号
      </h3>

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
        autocomplete="new-password"
      />

      {/* 注册按钮：与 LoginUI 保持完全一致的主主题反色/高亮样式 */}
      <button
        type="button"
        disabled={props.loading}
        onClick={handleSubmit}
        class="w-full max-w-[250px] h-[42px] rounded-lg font-medium text-sm flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs border"
        style={{
          "background-color": "var(--text-title)",
          "color": "var(--bg-main)",
          "border-color": "var(--border-color)",
        }}
      >
        <Show when={props.loading} fallback="注册">
          <span 
            class="inline-block animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
            style={{
              "border-color": "var(--bg-main)",
              "border-top-color": "transparent",
            }}
          />
        </Show>
      </button>

      {/* 只有存在 toLogin 回调时才显示 */}
      <Show when={props.toLogin}>
        <div class="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          已有账号？{" "}
          <button
            type="button"
            onClick={() => props.toLogin?.()}
            class="underline cursor-pointer font-medium bg-transparent border-none p-0 hover:opacity-75 transition-opacity"
            /* 💡 登录链接采用规范的 --text-link-color */
            style={{ color: "var(--text-link-color)" }}
          >
            登录
          </button>
        </div>
      </Show>
    </div>
  );
}

export default RegisterUI;