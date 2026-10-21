import { type JSX, type ParentProps, splitProps } from "solid-js";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  width?: number | string;
  height?: number | string;
  loading?: boolean;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "width",
    "height",
    "loading",
  ]);

  const toSize = (value?: number | string) =>
    typeof value === "number" ? `${value}px` : value ?? "100%";

  const bg = "var(--bg-main)";

  return (
    <div
      class="relative isolate box-border min-w-0 min-h-0 shrink-0 overflow-hidden transition-colors duration-300"
      style={{
        width: toSize(local.width),
        height: toSize(local.height),
        background: bg,
      }}
    >
      {/* 1. Epub.js 挂载容器 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 min-h-0 overflow-hidden"
        style={{ background: bg }}
      />

      {/* 2. 子节点插槽（FloatingButton 等悬浮组件） */}
      {local.children}

      {/* 3. 加载遮罩层：动态跟随全局主题背景 */}
      <div
        style={{ background: bg }}
        class={`absolute inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-200 ${
          local.loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div 
          class="h-6 w-6 animate-spin rounded-full border-2 border-t-2"
          style={{
            "border-color": "var(--border-color)",
            "border-top-color": "var(--accent-color)",
          }}
        />
      </div>
    </div>
  );
}

export default EpubView;