import { createStore } from "solid-js/store";

export type ThemeMode = 'default' | 'sepia' | 'eye-green' | 'gray';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  bg: string;
}

export const READER_THEMES: ThemeOption[] = [
  { id: 'default', name: '默认白', bg: '#ffffff' },
  { id: 'sepia', name: '羊皮纸', bg: '#f4ebd9' },
  { id: 'eye-green', name: '护眼绿', bg: '#c7edcc' },
  { id: 'gray', name: '优雅灰', bg: '#e9ecef' },
];

const KEYS = {
  BG: "READ_BACKGROUND_COLOR_KEY",
  POS: "READ_POSITION_KEY",
  SIZE: "READ_FONT_SIZE_KEY",
  THEME: "READ_THEME_KEY",
} as const;

// 安全的 LocalStorage 存取工具
const storage = {
  get: (key: string, fallback: string) => {
    try { return localStorage.getItem(key) || fallback; } 
    catch { return fallback; }
  },
  set: (key: string, val: string) => {
    try { localStorage.setItem(key, val); } 
    catch {}
  }
};

const initialThemeId = storage.get(KEYS.THEME, 'default') as ThemeMode;
const matchedTheme = READER_THEMES.find(t => t.id === initialThemeId) || READER_THEMES[0];

const [state, setState] = createStore({
  width: 0,
  height: 0,
  theme: matchedTheme.id,
  backgroundColor: storage.get(KEYS.BG, matchedTheme.bg),
  currentCfi: storage.get(KEYS.POS, ""),
  fontSize: Number(storage.get(KEYS.SIZE, "18")),
});

export const useStore2 = {
  // --- Readonly Getters ---
  get width() { return state.width; },
  get height() { return state.height; },
  get theme() { return state.theme; },
  get backgroundColor() { return state.backgroundColor; },
  get currentCfi() { return state.currentCfi; },
  get fontSize() { return state.fontSize; },

  // --- Actions ---
  setWidth: (width: number) => setState("width", width),
  setHeight: (height: number) => setState("height", height),

  /**
   * 💡 核心新增：设置主题（可直接传 ThemeOption 或 theme.id）
   * 会同步自动更新 theme、backgroundColor 和 localStorage
   */
  setTheme: (themeInput: ThemeMode | ThemeOption) => {
    const target = typeof themeInput === 'string'
      ? READER_THEMES.find(t => t.id === themeInput) || READER_THEMES[0]
      : themeInput;

    storage.set(KEYS.THEME, target.id);
    storage.set(KEYS.BG, target.bg);

    setState({
      theme: target.id,
      backgroundColor: target.bg,
    });
  },

  setBackgroundColor: (bg: string) => {
    storage.set(KEYS.BG, bg);
    setState("backgroundColor", bg);
  },

  setCurrentCfi: (cfi: string) => {
    storage.set(KEYS.POS, cfi);
    setState("currentCfi", cfi);
  },

  setFontSize: (size: number) => {
    const nextSize = Math.max(12, Math.min(32, size));
    storage.set(KEYS.SIZE, String(nextSize));
    setState("fontSize", nextSize);
  },
};