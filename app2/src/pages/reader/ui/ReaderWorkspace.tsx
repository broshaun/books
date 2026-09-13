import type { ReactNode, CSSProperties } from 'react';
import { Children, isValidElement, useState } from 'react';

export interface ReaderWorkspaceProps {
  showNote?: boolean;
  height?: CSSProperties['height'];
  width?: CSSProperties['width'];
  children: ReactNode;
}

export function ReaderWorkspaceMain({ 
  showNote = true, 
  height = '100%', 
  width = '100%', 
  children 
}: ReaderWorkspaceProps) {
  const [isLandscape] = useState(() => typeof window === 'undefined' || window.innerWidth >= window.innerHeight);
  const showNotes = isLandscape && showNote;

  let epub: ReactNode = null;
  let notes: ReactNode = null;

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Epub) epub = child;
      if (child.type === Notes) notes = child;
    }
  });

  return (
    <div className="flex overflow-hidden" style={{ width, height }}>
      <div className={`h-full overflow-auto ${showNotes ? 'w-[70%]' : 'w-full'}`}>
        {epub}
      </div>
      {showNotes && (
        <div className="w-[30%] h-full overflow-auto border-l border-gray-100 dark:border-zinc-800">
          {notes}
        </div>
      )}
    </div>
  );
}

export function Epub({ children }: { children: ReactNode }) { return <>{children}</>; }
export function Notes({ children }: { children: ReactNode }) { return <>{children}</>; }

export const ReaderWorkspace = Object.assign(ReaderWorkspaceMain, { Epub, Notes });
export default ReaderWorkspace;