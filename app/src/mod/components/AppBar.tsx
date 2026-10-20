import type { JSX } from "solid-js";

export interface AppBarProps {
  title: string;
  left?: JSX.Element;
  right?: JSX.Element;
}

export function AppBar(props: AppBarProps) {
  return (
    <div 
      class="grid grid-cols-12 items-center px-4 py-3 w-full select-none outline-none box-border border-b"
      style={{
        "background-color": "var(--bg-header)",
        "color": "var(--text-color)",
        "border-color": "var(--border-color)", // 💡 完美引入全局专属边框颜色，层次感更强
      }}
    >
      <div class="col-span-2 flex items-center justify-start">{props.left}</div>
      <div class="col-span-8 flex items-center justify-center">
        <h1 
          class="text-base font-semibold truncate tracking-tight select-none" 
          style={{ color: "inherit" }}
        >
          {props.title}
        </h1>
      </div>
      <div class="col-span-2 flex items-center justify-end">{props.right}</div>
    </div>
  );
}

export default AppBar;