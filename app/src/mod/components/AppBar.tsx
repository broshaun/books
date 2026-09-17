import type { JSX } from "solid-js";

export interface AppBarProps {
  title: string;
  left?: JSX.Element;
  right?: JSX.Element;
  /**
   * 主题风格选项
   * - 'default': 默认亮色系（Slate）
   * - 'zinc': 沉浸式深色系（Zinc-900，与前面的书架/抽屉风格统一）
   */
  theme?: "default" | "zinc";
}

export function AppBar(props: AppBarProps) {
  // 根据不同的主题返回对应的样式类名
  const themeClasses = () => {
    if (props.theme === "zinc") {
      return "bg-zinc-900 text-zinc-100 border-b border-zinc-800";
    }
    // 默认主题（保持原样）
    return "bg-transparent text-slate-900";
  };

  const titleClasses = () => {
    if (props.theme === "zinc") {
      return "text-base font-semibold truncate text-zinc-100 tracking-tight";
    }
    return "text-base font-semibold truncate text-slate-800 dark:text-slate-100";
  };

  return (
    <div class={`grid grid-cols-12 items-center p-3.5 w-full ${themeClasses()}`}>
      <div class="col-span-2 flex items-center justify-start">{props.left}</div>
      <div class="col-span-8 flex items-center justify-center">
        <h1 class={titleClasses()}>{props.title}</h1>
      </div>
      <div class="col-span-2 flex items-center justify-end">{props.right}</div>
    </div>
  );
}

export default AppBar;