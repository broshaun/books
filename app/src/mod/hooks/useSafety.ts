import { createSignal, createMemo } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

interface Config { top: number; bottom: number }
interface State { portrait: Config; landscape: Config }

const KEY = "safety-config-v2";
const def: Config = { top: 0, bottom: 0 };
const isBrowser = typeof window !== "undefined";

// 1. 全局监听横竖屏
const media = isBrowser ? window.matchMedia("(orientation: landscape)") : null;
const [isLandscape, setIsLandscape] = createSignal(media?.matches ?? false);
media?.addEventListener("change", (e) => setIsLandscape(e.matches));

// 2. 加载本地缓存（精简了解析逻辑）
const loadState = (): State => {
  if (!isBrowser) return { portrait: def, landscape: def };
  try {
    const raw = localStorage.getItem(KEY);
    const d = raw ? (JSON.parse(raw)?.state ?? JSON.parse(raw)) : {};
    const parseCfg = (c: any) => ({ top: Number(c?.top) || 0, bottom: Number(c?.bottom) || 0 });
    return { portrait: parseCfg(d.portrait), landscape: parseCfg(d.landscape) };
  } catch {
    return { portrait: def, landscape: def };
  }
};

const [state, setState] = createStore<State>(loadState());

// 3. 持久化存储封装
const persist = (mode: keyof State, key: keyof Config, val: number) => {
  setState(mode, key, val);
  if (isBrowser) {
    try { localStorage.setItem(KEY, JSON.stringify({ state: unwrap(state) })); } catch {}
  }
};


/** 检查是否存在本地安全区配置 */
export const hasSafetyConfig = () => isBrowser && localStorage.getItem(KEY) !== null;

/** 屏幕安全区适配 Hook */
export function useSafety() {
  const mode = createMemo(() => (isLandscape() ? "landscape" : "portrait") as keyof State);

  return {
    top: () => state[mode()].top,
    bottom: () => state[mode()].bottom,
    setTop: (val: number) => persist(mode(), "top", val),
    setBottom: (val: number) => persist(mode(), "bottom", val),
  };
}