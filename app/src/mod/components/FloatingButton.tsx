import { type JSX, splitProps, Show } from "solid-js";

export interface FloatingButtonProps {
  initialX?: number | string;
  initialY?: number | string;
  icon?: JSX.Element;
  iconPosition?: "left" | "right";
  label?: string;
  onClick?: (e: MouseEvent) => void;
  show?: boolean;
}

export function FloatingButton(props: FloatingButtonProps) {
  const [local, rest] = splitProps(props, [
    "initialX",
    "initialY",
    "icon",
    "iconPosition",
    "label",
    "onClick",
    "show",
  ]);

  /** 
   * 💡 智能解析坐标：
   * 如果传的是数字并且小于 0（例如 -16），自动转为基于 right/bottom 的定位 (16px)
   * 其它情况正常处理像素或字符串
   */
  const parsePositionStyle = (x?: number | string, y?: number | string) => {
    const style: Record<string, string> = {};

    // 处理 X 轴 (left / right)
    if (typeof x === "number" && x < 0) {
      style.right = `${Math.abs(x)}px`;
    } else if (typeof x === "string" && x.startsWith("-")) {
      style.right = `${parseFloat(x)}px`;
    } else {
      style.left = x === undefined ? "16px" : typeof x === "number" ? `${x}px` : x;
    }

    // 处理 Y 轴 (top / bottom)
    if (typeof y === "number" && y < 0) {
      style.bottom = `${Math.abs(y)}px`;
    } else if (typeof y === "string" && y.startsWith("-")) {
      style.bottom = `${parseFloat(y)}px`;
    } else {
      style.top = y === undefined ? "16px" : typeof y === "number" ? `${y}px` : y;
    }

    return style;
  };

  const isIconRight = () => local.iconPosition === "right";

  return (
    <Show when={local.show ?? true}>
      <button
        {...rest}
        type="button"
        style={{
          ...parsePositionStyle(local.initialX, local.initialY),
          /* 💡 完美映射全局主题变量：卡片表面背景、主文本、边框与复合阴影 */
          "background-color": "var(--bg-surface)",
          "color": "var(--text-main)",
          "border-color": "var(--border-color)",
          "box-shadow": "var(--shadow-md)",
        }}
        class={`absolute z-50 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs backdrop-blur-md cursor-pointer select-none transition-all duration-300 active:scale-95 ${
          isIconRight() ? "flex-row-reverse" : "flex-row"
        }`}
        on:click={(e) => {
          e.stopPropagation();
          e.preventDefault();
          local.onClick?.(e);
        }}
        /* 💡 悬停时采用明确的 --bg-button-hover 变量，确保各个换肤模式下过渡自然 */
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
      >
        {local.icon}
        {local.label && <span class="font-medium" style={{ color: "inherit" }}>{local.label}</span>}
      </button>
    </Show>
  );
}

export default FloatingButton;