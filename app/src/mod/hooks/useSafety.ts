import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

interface LayoutConfig {
  bottom: number;
  top: number;
}

interface SafetyState {
  portrait: LayoutConfig;
  landscape: LayoutConfig;
}

const STORAGE_KEY = "safety-config-v2";
const defaultLayout: LayoutConfig = { bottom: 0, top: 0 };

// 1. 使用 matchMedia 的 change 事件高效监听横竖屏切换
const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(orientation: landscape)") : null;
const [isLandscape, setIsLandscape] = createSignal(mediaQuery?.matches ?? false);
mediaQuery?.addEventListener("change", (e) => setIsLandscape(e.matches));

// 2. 初始化状态读取
const getInitialState = (): SafetyState => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const data = (JSON.parse(item)?.state ?? JSON.parse(item)) || {};
      return {
        portrait: { top: Number(data.portrait?.top) || 0, bottom: Number(data.portrait?.bottom) || 0 },
        landscape: { top: Number(data.landscape?.top) || 0, bottom: Number(data.landscape?.bottom) || 0 },
      };
    }
  } catch {}
  return { portrait: defaultLayout, landscape: defaultLayout };
};

const [state, setState] = createStore<SafetyState>(getInitialState());

// 3. 统一保存逻辑
const persistAndSet = (mode: "portrait" | "landscape", key: "top" | "bottom", value: number) => {
  setState(mode, key, value);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 1 }));
  } catch {}
};

export const useSafety = () => {
  const mode = () => (isLandscape() ? "landscape" : "portrait");

  return {
    get bottom() { return state[mode()].bottom; },
    get top() { return state[mode()].top; },
    setBottom: (val: number) => persistAndSet(mode(), "bottom", val),
    setTop: (val: number) => persistAndSet(mode(), "top", val),
  };
};

export const hasSafetyConfig = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};