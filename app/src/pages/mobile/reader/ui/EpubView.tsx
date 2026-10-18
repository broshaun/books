
import {
  type JSX,
  type ParentProps,
  splitProps,
} from "solid-js";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  bg?: string;
  width?: number | string;
  height?: number | string;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "width",
    "height",
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
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 min-h-0 overflow-hidden"
        style={{
          background: currentBg(),
        }}
      >
        {local.children}
      </div>
    </div>
  );
}

export default EpubView;
