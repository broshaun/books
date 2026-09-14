import { createSignal, onMount, onCleanup } from "solid-js";

export interface WindowDimensions {
  width: number;
  height: number;
}

export const winSize = (def: WindowDimensions = { width: 480, height: 800 }): WindowDimensions =>
  typeof window !== "undefined" ? { width: window.innerWidth, height: window.innerHeight } : def;

export function createWindowSize(def?: WindowDimensions) {
  const [size, setSize] = createSignal(winSize(def));

  onMount(() => {
    const handler = () => setSize(winSize(def));
    window.addEventListener("resize", handler);
    onCleanup(() => window.removeEventListener("resize", handler));
  });

  return {
    get width() { return size().width; },
    get height() { return size().height; },
  };
}