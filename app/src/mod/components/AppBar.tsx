import type { JSX } from "solid-js";

export function AppBar(props: { title: string; left?: JSX.Element; right?: JSX.Element }) {
  return (
    <div class="grid grid-cols-12 items-center p-3.5 w-full">
      <div class="col-span-2 flex items-center justify-start">{props.left}</div>
      <div class="col-span-8 flex items-center justify-center">
        <h1 class="text-base font-semibold truncate text-slate-800 dark:text-slate-100">
          {props.title}
        </h1>
      </div>
      <div class="col-span-2 flex items-center justify-end">{props.right}</div>
    </div>
  );
}