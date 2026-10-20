import type { JSX } from "solid-js";

export interface TopBarOccluderProps {
  /** 顶栏配置（与 AppShell 的 header 配置保持一致） */
  header?: {
    height?: number;
    margin?: number;
    padding?: number;
  };
  /** 是否开启毛玻璃效果，默认开启 */
  blur?: boolean;
  /** 自定义背景色 */
  bg?: string;
  /** 自定义类名 */
  class?: string;
  /** 子元素 */
  children?: JSX.Element;
}

export function TopBarOccluder(props: TopBarOccluderProps) {
  // 计算外部的总高度（与 AppShell 内部计算逻辑完全一致）
  const headerHeight = () => (props.header?.height ?? 0) + (props.header?.padding ?? 0);
  const headerMargin = () => props.header?.margin ?? 0;
  
  // 如果处于安全区环境，也可以在这里统一纳管
  const safeTop = "env(safe-area-inset-top, 0px)";

  return (
    <div
      class={`absolute top-0 left-0 right-0 z-20 pointer-events-none box-border ${
        props.blur !== false ? "backdrop-blur-md" : ""
      } ${props.bg ?? "bg-white/80 dark:bg-zinc-900/80"} ${props.class ?? ""}`}
      style={{
        // 动态计算总高度：margin + size + safe-top
        height: `calc(${headerHeight()}px + ${headerMargin()}px + ${safeTop})`,
        "border-bottom": "1px solid var(--border-color, rgba(0, 0, 0, 0.06))",
      }}
    >
      {props.children}
    </div>
  );
}
