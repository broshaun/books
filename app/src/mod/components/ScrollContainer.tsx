import { type JSX, type ParentProps, splitProps } from "solid-js";

export interface ScrollContainerProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * 下拉容器 (ScrollContainer)
 * 极致精简与通用：自动合并任意 class、style 及原生事件，开箱即用。
 */
export function ScrollContainer(props: ScrollContainerProps) {
  const [local, rest] = splitProps(props, ["children"]);

  return (
    <div
      {...rest}
      class="h-full w-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden custom-thin-scroll"
    >
      {local.children}
    </div>
  );
}