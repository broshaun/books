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
   * - 如果传的是数字并且小于 0（例如 -16），自动转为基于 right/bottom 的定位 (16px)
   * - 其它情况正常处理像素或字符串
   */
  const parsePositionStyle = (x?: number | string, y?: number | string) => {
    const style: Record<string, string> = {};

    // 处理 X 轴 (left / right)
    if (typeof x === "number" && x < 0) {
      style.right = `${Math.abs(x)}px`;
    } else if (typeof x === "string" && x.startsWith("-")) {
      style.right = `${parseFloat(x)}px`; // 兼容 "-16px" 格式
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
        style={parsePositionStyle(local.initialX, local.initialY)}
        class={`absolute z-50 flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs text-stone-700 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800 ${
          isIconRight() ? "flex-row-reverse" : "flex-row"
        }`}
        on:click={(e) => {
          e.stopPropagation();
          e.preventDefault();
          local.onClick?.(e);
        }}
      >
        {local.icon}
        {local.label && <span class="font-medium">{local.label}</span>}
      </button>
    </Show>
  );
}
