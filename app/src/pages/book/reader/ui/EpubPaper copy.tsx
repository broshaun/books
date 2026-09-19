import { type ParentProps, splitProps, type JSX } from 'solid-js';

export interface EpubPaperProps extends ParentProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
  ref?: JSX.IntrinsicElements['div']['ref'];
}

export function EpubPaper(props: EpubPaperProps) {
  let containerRef: HTMLDivElement | undefined;

  const [local, rest] = splitProps(props, ['children', 'ref']);

  const setRef = (el: HTMLDivElement) => {
    containerRef = el;
    
    if (typeof local.ref === 'function') {
      local.ref(el);
    } else if (local.ref && typeof local.ref === 'object') {
      (local.ref as any).current = el;
    }
  };

  return (
    <div
      ref={setRef}
      class="text-slate-800 dark:text-slate-100 transition-colors h-full"
      {...rest}
    >
      {local.children}
    </div>
  );
}

export default EpubPaper;