import { type JSX, splitProps } from 'solid-js';

export interface BurgerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  opened?: boolean;               // 是否处于打开状态（可用于变成 X 形动画，当前为基础汉堡）
  color?: string;                 // 图标颜色，默认 stone-600
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number; // 尺寸大小
  m?: string;                     // 外边距（如 'sm', 'md', 'lg' 或具体类名）
}

const SIZE_MAP = {
  xs: { width: '16px', barHeight: '1.5px', gap: '4px' },
  sm: { width: '20px', barHeight: '2px', gap: '5px' },
  md: { width: '24px', barHeight: '2.5px', gap: '6px' },
  lg: { width: '28px', barHeight: '3px', gap: '7px' },
  xl: { width: '32px', barHeight: '3.5px', gap: '8px' },
};

export function Burger(props: BurgerProps) {
  const [local, rest] = splitProps(props, [
    'opened',
    'color',
    'size',
    'm',
    'class',
  ]);

  // 解析尺寸
  const dimension = () => {
    if (typeof local.size === 'number') {
      return { width: `${local.size}px`, barHeight: '2px', gap: `${Math.max(4, local.size / 4)}px` };
    }
    return SIZE_MAP[local.size || 'sm'];
  };

  // 处理外边距类名或样式
  const marginClass = () => {
    if (!local.m) return '';
    if (local.m === 'sm') return 'm-2';
    if (local.m === 'md') return 'm-4';
    if (local.m === 'lg') return 'm-6';
    return '';
  };

  const barColor = local.color || 'currentColor';

  return (
    <button
      type="button"
      aria-label="Toggle navigation"
      class={`relative flex flex-col justify-between p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer bg-transparent border-none outline-none ${marginClass()} ${local.class || ''}`}
      style={{
        width: `calc(${dimension().width} + 12px)`,
        height: `calc(${dimension().width} + 12px)`,
      }}
      {...rest}
    >
      <div class="absolute inset-0 m-auto flex flex-col justify-center items-center" style={{ gap: dimension().gap }}>
        <div
          class="rounded-full transition-transform duration-300"
          style={{ width: dimension().width, height: dimension().barHeight, 'background-color': barColor }}
        />
        <div
          class="rounded-full transition-opacity duration-300"
          style={{ width: dimension().width, height: dimension().barHeight, 'background-color': barColor }}
        />
        <div
          class="rounded-full transition-transform duration-300"
          style={{ width: dimension().width, height: dimension().barHeight, 'background-color': barColor }}
        />
      </div>
    </button>
  );
}

export default Burger;