import { createSignal, onMount, onCleanup, type JSX, type ParentProps } from 'solid-js';

// 🌟 修改点：继承 ParentProps<{ ... }> 以支持 children 属性
export interface ReaderWorkspaceProps extends ParentProps {
  showNote?: boolean;
  height?: string | number;
  width?: string | number;
  epub?: JSX.Element;
  notes?: JSX.Element;
}

// 辅助函数：将 string | number 统一转为安全的 CSS 尺寸字符串
const parseCSSSize = (size?: string | number) => {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
};

export function ReaderWorkspaceMain(props: ReaderWorkspaceProps) {
  const [isLandscape, setIsLandscape] = createSignal(
    typeof window === 'undefined' || window.innerWidth >= window.innerHeight
  );

  onMount(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const showNotes = () => isLandscape() && (props.showNote ?? true);

  return (
    <div
      class="flex overflow-hidden"
      style={{
        width: parseCSSSize(props.width) ?? '100%',
        height: parseCSSSize(props.height) ?? '100%',
      }}
    >
      <div class={`h-full overflow-auto transition-all duration-300 ${showNotes() ? 'w-[70%]' : 'w-full'}`}>
        {props.epub}
      </div>

      {showNotes() && (
        <div class="w-[30%] h-full overflow-auto border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {props.notes}
        </div>
      )}
      
      {/* 兼容直接写子组件的用法 */}
      {props.children}
    </div>
  );
}

export function Epub(props: ParentProps) {
  return <>{props.children}</>;
}

export function Notes(props: ParentProps) {
  return <>{props.children}</>;
}

export const ReaderWorkspace = Object.assign(ReaderWorkspaceMain, { Epub, Notes });
export default ReaderWorkspace;