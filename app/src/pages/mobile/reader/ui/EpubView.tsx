import { type JSX, type ParentProps, splitProps, Show } from "solid-js";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  bg?: string;
  width?: number | string;
  height?: number | string;
  controlsEnabled?: boolean;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "width",
    "height",
    "controlsEnabled",
  ]);

  const toSize = (v?: number | string) => (typeof v === "number" ? `${v}px` : v ?? "100%");
  const currentBg = () => local.bg || "#ffffff";

  return (
    <div
      class="relative isolate overflow-hidden shrink-0"
      style={{
        width: toSize(local.width),
        height: toSize(local.height),
        background: currentBg(),
      }}
    >
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full overflow-y-auto"
        style={{ background: currentBg() }}
      >
        {local.children}
      </div>
    </div>
  );
}

export default EpubView;