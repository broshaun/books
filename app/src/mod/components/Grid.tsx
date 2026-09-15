import { type ParentProps, splitProps, type JSX } from 'solid-js';

export interface GridColProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  /** 栅格占据列数 (1 - 12) 或 'auto' */
  span?: number | 'auto' | 'content';
  /** 偏移列数 (1 - 11) */
  offset?: number;
  class?: string;
}

export interface GridProps extends ParentProps, JSX.HTMLAttributes<HTMLDivElement> {
  /** 间距（支持数字如 16 或字符串如 "1rem"） */
  gutter?: number | string;
  /** 是否自动均分剩余空间 */
  grow?: boolean;
  /** 主轴对齐方式 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** 交叉轴对齐方式 */
  align?: 'start' | 'center' | 'end' | 'stretch';
  class?: string;
}

function GridCol(props: GridColProps) {
  const [local, rest] = splitProps(props, ['span', 'offset', 'class', 'children']);

  // 映射 12 栅格宽度类
  const getSpanClass = () => {
    const s = local.span ?? 12;
    if (s === 'auto') return 'col-auto';
    if (s === 'content') return 'col-span-auto';
    return `col-span-${s}`;
  };

  // 映射偏移类
  const getOffsetClass = () => {
    if (!local.offset || local.offset < 1 || local.offset > 11) return '';
    return `col-start-${local.offset + 1}`;
  };

  return (
    <div
      class={`box-border ${getSpanClass()} ${getOffsetClass()} ${local.class || ''}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export function Grid(props: GridProps) {
  const [local, rest] = splitProps(props, ['gutter', 'grow', 'justify', 'align', 'class', 'children']);

  const getJustifyClass = () => {
    switch (local.justify) {
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      default: return 'justify-start';
    }
  };

  const getAlignClass = () => {
    switch (local.align) {
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      default: return 'items-start';
    }
  };

  const parseGutter = (g?: number | string) => {
    if (g === undefined) return '1rem';
    return typeof g === 'number' ? `${g}px` : g;
  };

  return (
    <div
      class={`grid grid-cols-12 w-full ${local.grow ? 'auto-cols-fr' : ''} ${getJustifyClass()} ${getAlignClass()} ${local.class || ''}`}
      style={{
        gap: parseGutter(local.gutter),
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
}

Grid.Col = GridCol;

export default Grid;