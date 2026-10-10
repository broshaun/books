import { type JSX, splitProps, Show } from 'solid-js';

export interface BurgerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  p?: number | string;   // 内边距（如 2、'8px' 或 Tailwind 类名如 'p-2'）
  icon?: JSX.Element;    // 自定义图标
}

export function Burger(props: BurgerProps) {
  const [local, rest] = splitProps(props, ['p', 'class', 'icon']);

  const paddingStyle = () => {
    const p = local.p;
    if (p === undefined) return 'p-1.5';
    if (typeof p === 'number') return '';
    return p;
  };

  return (
    <button
      type="button"
      aria-label="Toggle navigation"
      class={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer bg-transparent border-none outline-none ${paddingStyle()} ${local.class || ''}`}
      style={typeof local.p === 'number' ? { padding: `${local.p}px` } : undefined}
      {...rest}
    >
      <Show
        when={local.icon}
        fallback={
          // 默认三道杠
          <div class="w-5 h-4 flex flex-col justify-between">
            <div class="w-full h-[2px] rounded-full bg-stone-600" />
            <div class="w-full h-[2px] rounded-full bg-stone-600" />
            <div class="w-full h-[2px] rounded-full bg-stone-600" />
          </div>
        }
      >
        {local.icon}
      </Show>
    </button>
  );
}

export default Burger;