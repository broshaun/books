import { type JSX, splitProps } from "solid-js";

export interface FloatingButtonProps {
  initialX?: number | string;
  initialY?: number | string;
  icon?: JSX.Element;
  label?: string;
  onClick?: (e: MouseEvent) => void;
  class?: string;
}

export function FloatingButton(props: FloatingButtonProps) {
  const [local, rest] = splitProps(props, [
    "initialX",
    "initialY",
    "icon",
    "label",
    "onClick",
    "class",
  ]);

  const parseCoord = (v?: number | string, defaultVal = 16) => {
    if (v === undefined) return `${defaultVal}px`;
    return typeof v === "number" ? `${v}px` : v;
  };

  return (
    <button
      {...rest}
      type="button"
      style={{
        left: parseCoord(local.initialX, 16),
        top: parseCoord(local.initialY, 16),
      }}
      class={`absolute z-50 flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs text-stone-700 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800 ${
        local.class || ""
      }`}
      // 🚀 关键修改：使用 on:click 原生绑定，防止 Portal 和 corvu 事件冲突
      on:click={(e) => {
        e.stopPropagation();
        e.preventDefault();
        local.onClick?.(e);
      }}
    >
      {local.icon}
      {local.label && <span class="font-medium">{local.label}</span>}
    </button>
  );
}

export default FloatingButton;