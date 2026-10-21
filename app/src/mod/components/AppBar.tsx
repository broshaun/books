import type { JSX } from "solid-js";

export interface AppBarProps {
  title: string;
  subtitle?: string;
  left?: JSX.Element;
  right?: JSX.Element;
  height?: string | number;
}

export function AppBar(props: AppBarProps) {
  const height = () => 
    props.height === undefined ? "56px" : typeof props.height === "number" ? `${props.height}px` : props.height;

  return (
    <div 
      class="grid grid-cols-12 items-center px-4 w-full select-none outline-none border-b box-border"
      style={{
        "height": height(),
        "background-color": "var(--bg-surface)",
        "border-color": "var(--border-color)",
        "box-shadow": "var(--shadow-md)"
      }}
    >
      <div class="col-span-3 flex items-center justify-start h-full">{props.left}</div>
      <div class="col-span-6 flex flex-col items-center justify-center h-full text-center">
        <h1 class="text-sm font-bold truncate tracking-tight select-none leading-tight">{props.title}</h1>
        {props.subtitle && (
          <span class="text-[10px] truncate select-none leading-tight mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {props.subtitle}
          </span>
        )}
      </div>
      <div class="col-span-3 flex items-center justify-end h-full">{props.right}</div>
    </div>
  );
}

export default AppBar;