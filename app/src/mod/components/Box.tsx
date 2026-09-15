import { type ParentProps, splitProps, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export interface BoxProps extends ParentProps, Omit<JSX.HTMLAttributes<HTMLElement>, 'style'> {
  /** 渲染的 HTML 标签或组件 (默认 'div') */
  component?: keyof JSX.IntrinsicElements | string | ((props: Record<string, unknown>) => JSX.Element);
  /** 高度（支持数字如 100 或字符串如 "100%"、"50vh"） */
  height?: string | number;
  /** 高度别名（支持数字如 100 或字符串如 "100%"） */
  h?: string | number;
  /** 宽度（支持数字如 100 或字符串如 "100%"） */
  width?: string | number;
  /** 宽度别名 */
  w?: string | number;
  /** 自定义 class 样式 */
  class?: string;
  /** 自定义行内样式 */
  style?: JSX.CSSProperties;
}

// 尺寸工具：数字自动转 px，字符串原样输出
const parseSize = (size?: string | number) => 
  typeof size === 'number' ? `${size}px` : size;

export function Box(props: BoxProps) {
  const [local, rest] = splitProps(props, [
    'component',
    'height',
    'h',
    'width',
    'w',
    'class',
    'style',
    'children',
  ]);

  const elementTag = () => local.component || 'div';
  const finalHeight = () => parseSize(local.h ?? local.height);
  const finalWidth = () => parseSize(local.w ?? local.width);

  return (
    <Dynamic
      component={elementTag()}
      class={local.class}
      style={{
        ...(finalHeight() ? { height: finalHeight() } : {}),
        ...(finalWidth() ? { width: finalWidth() } : {}),
        ...local.style,
      }}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
}

export default Box;