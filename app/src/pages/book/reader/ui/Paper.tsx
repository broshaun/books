import { type ParentProps, splitProps, type JSX } from 'solid-js';

export type MantineSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | (string & {});

export interface PaperProps extends ParentProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
  /** 阴影大小：'xs' | 'sm' | 'md' | 'lg' | 'xl' */
  shadow?: MantineSize | 'none';
  /** 圆角大小：'xs' | 'sm' | 'md' | 'lg' | 'xl' 或具体的数值/字符串 */
  radius?: MantineSize | number | string;
  /** 内边距：'xs' | 'sm' | 'md' | 'lg' | 'xl' 或具体的数值/字符串 */
  p?: MantineSize | number | string;
  /** 是否显示边框 */
  withBorder?: boolean;
  /** 背景色（支持色值，如 hex、rgb 或 CSS 变量） */
  bg?: string;
  /** 文本颜色 */
  c?: string;
  /** 高度（支持数字如 500 或字符串如 "100%"） */
  h?: string | number;
  /** 宽度（支持数字如 300 或字符串如 "100%"） */
  w?: string | number;
  /** 兼容别名：height */
  height?: string | number;
  /** 兼容别名：width */
  width?: string | number;
  /** DOM 引用（支持回调函数或 ref 变量，可用于 epub.js 的 renderTo） */
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
  /** 自定义 class 样式类 */
  class?: string;
  /** 兼容 React 习惯的 className */
  className?: string;
  /** 自定义行内样式 */
  style?: JSX.CSSProperties;
}

// 辅助函数：安全解析尺寸或颜色值（数字转 px，字符串原样输出）
const parseSize = (size?: string | number) => {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
};

export function Paper(props: PaperProps) {
  // 使用 splitProps 抽离所有 Mantine 原生参数，其余原生事件与属性自动进入 rest
  const [local, rest] = splitProps(props as Record<string, any>, [
    'shadow',
    'radius',
    'p',
    'withBorder',
    'bg',
    'c',
    'h',
    'w',
    'height',
    'width',
    'ref',
    'class',
    'className',
    'style',
    'children',
  ]);

  // 1. 阴影映射
  const shadowClass = () => {
    switch (local.shadow) {
      case 'xs': return 'shadow-xs';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return 'shadow-none';
    }
  };

  // 2. 预设圆角映射（如果是 xs~xl 则走 Tailwind 类，如果是自定义数值则走 style）
  const radiusClass = () => {
    switch (local.radius) {
      case 'xs': return 'rounded-sm';
      case 'sm': return 'rounded';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'none': return 'rounded-none';
      default: return ''; // 自定义尺寸走 inline style
    }
  };

  // 3. 预设内边距映射
  const paddingClass = () => {
    switch (local.p) {
      case 'xs': return 'p-2';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-5';
      case 'xl': return 'p-6';
      case 'none': return 'p-0';
      default: return ''; // 自定义尺寸走 inline style
    }
  };

  // 4. 边框样式（Mantine 黑白灰暗黑模式适配）
  const borderClass = () =>
    local.withBorder
      ? 'border border-slate-200 dark:border-zinc-800'
      : '';

  // 尺寸计算（同时兼容 h/w 和 height/width 简写）
  const finalHeight = () => parseSize(local.h ?? local.height);
  const finalWidth = () => parseSize(local.w ?? local.width);
  const finalRadius = () => (['xs', 'sm', 'md', 'lg', 'xl', 'none'].includes(local.radius) ? undefined : parseSize(local.radius));
  const finalPadding = () => (['xs', 'sm', 'md', 'lg', 'xl', 'none'].includes(local.p) ? undefined : parseSize(local.p));

  return (
    <div
      ref={local.ref}
      {...rest}
      class={`bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 transition-colors ${shadowClass()} ${radiusClass()} ${paddingClass()} ${borderClass()} ${
        local.class || local.className || ''
      }`}
      style={{
        ...(finalHeight() ? { height: finalHeight() } : {}),
        ...(finalWidth() ? { width: finalWidth() } : {}),
        ...(finalRadius() ? { 'border-radius': finalRadius() } : {}),
        ...(finalPadding() ? { padding: finalPadding() } : {}),
        ...(local.bg ? { 'background-color': local.bg } : {}),
        ...(local.c ? { color: local.c } : {}),
        ...local.style,
      }}
    >
      {local.children}
    </div>
  );
}

export default Paper;