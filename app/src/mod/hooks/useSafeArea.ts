import { createSignal, onCleanup, onMount } from "solid-js";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea() {
  const [safeArea, setSafeArea] = createSignal<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const measureSafeArea = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = "10px";
    div.style.height = "10px";
    div.style.paddingTop = "env(safe-area-inset-top, 0px)";
    div.style.paddingBottom = "env(safe-area-inset-bottom, 0px)";
    div.style.paddingLeft = "env(safe-area-inset-left, 0px)";
    div.style.paddingRight = "env(safe-area-inset-right, 0px)";
    div.style.visibility = "hidden";
    div.style.pointerEvents = "none";

    document.body.appendChild(div);
    const computed = window.getComputedStyle(div);
    
    const top = parseFloat(computed.paddingTop) || 0;
    const bottom = parseFloat(computed.paddingBottom) || 0;
    const left = parseFloat(computed.paddingLeft) || 0;
    const right = parseFloat(computed.paddingRight) || 0;

    document.body.removeChild(div);
    setSafeArea({ top, bottom, left, right });
  };

  onMount(() => {
    measureSafeArea();
    window.addEventListener("resize", measureSafeArea);
    window.addEventListener("orientationchange", measureSafeArea);

    onCleanup(() => {
      window.removeEventListener("resize", measureSafeArea);
      window.removeEventListener("orientationchange", measureSafeArea);
    });
  });

  return safeArea;
}