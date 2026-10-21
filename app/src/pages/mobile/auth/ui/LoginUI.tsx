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
        /* 💡 适配新的独立输入框背景色 */
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
      class="flex flex-col items-center justify-center gap-4 w-full h-full min-h-fit p-6 box-border select-none transition-colors"
      style={{
        "background-color": "var(--bg-main)",
        "color": "var(--text-main)",
      }}
    >
      {/* 💡 标题采用全新的 --text-title 变量，层次分明 */}
      <h3 
        class="text-lg font-bold tracking-tight" 
        style={{ color: "var(--text-title)" }}
      >
        登录界面
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
        autocomplete="current-password"
      />

      {/* 登录按钮：使用主文本颜色和主背景色形成对比，或者采用链接色 */}
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
        <div class="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          还没有账号？{" "}
          <button
            type="button"
            onClick={() => props.toRegister?.()}
            class="underline cursor-pointer font-medium bg-transparent border-none p-0 hover:opacity-75 transition-opacity"
            /* 💡 注册链接采用全新的 --text-link-color 统一色彩 */
            style={{ color: "var(--text-link-color)" }}
          >
            注册账号
          </button>
        </div>
      </Show>
    </div>
  );
}

export default LoginUI;