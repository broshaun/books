import { type JSX, type ParentProps, splitProps } from "solid-js";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  bg?: string;
  width?: number | string;
  height?: number | string;
  loading?: boolean;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "width",
    "height",
    "loading",
  ]);

  const toSize = (value?: number | string) =>
    typeof value === "number"
      ? `${value}px`
      : value ?? "100%";

  const currentBg = () => local.bg ?? "#ffffff";

  return (
    <div
      class="relative isolate box-border min-w-0 min-h-0 shrink-0 overflow-hidden"
      style={{
        width: toSize(local.width),
        height: toSize(local.height),
        background: currentBg(),
      }}
    >
      {/* 1. Epub.js 挂载容器 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 min-h-0 overflow-hidden"
        style={{
          background: currentBg(),
        }}
      />

      {/* 2. 子节点插槽（FloatingButton 放在这里，会自动以 EpubView 为定位参考系，随 EpubView 缩放而自动跟随！） */}
      {local.children}

      {/* 3. 加载遮罩层 */}
      <div
        style={{ background: currentBg() }}
        class={`absolute inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-200 ${
          local.loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div class="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-amber-600 dark:border-zinc-700 dark:border-t-amber-500" />
      </div>
    </div>
  );
}

export default EpubView;