import { type ParentProps, splitProps, type JSX } from 'solid-js';

export interface PaperProps extends ParentProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | (string & {});
  p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | (string & {});
  bg?: string;
  height?: number;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
  class?: string;
}

export function EpubPaper(props: PaperProps) {
  const [local, rest] = splitProps(props as Record<string, any>, [
    'radius', 'p', 'bg', 'height', 'class', 'children', 'ref'
  ]);

  // Tailwind 圆角映射
  const radiusClass = (r?: string) => {
    switch (r) {
      case 'xs': return 'rounded-sm';
      case 'sm': return 'rounded';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'none': return 'rounded-none';
      default: return 'rounded-md';
    }
  };

  // Tailwind 内边距映射
  const paddingClass = (p?: string) => {
    switch (p) {
      case 'xs': return 'p-2';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-5';
      case 'xl': return 'p-6';
      case 'none': return 'p-0';
      default: return 'p-0';
    }
  };

  return (
    <div
      ref={local.ref}
      // 🌟 默认加入 h-full，如果未传 height 则自动继承/填满上级高度
      class={`bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 transition-colors h-full ${radiusClass(local.radius)} ${paddingClass(local.p)} ${local.class || ''}`}
      style={{
        ...(local.height !== undefined ? { height: `${local.height}px` } : {}),
        ...(local.bg ? { 'background-color': local.bg } : {}),
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export default EpubPaper;