import { createStore } from "solid-js/store";

export interface StoreState {
  height: number;
  backgroundColor: string;
  currentCfi: string;
  fontSize: number; // 新增：字体大小
  setHeight: (height: number) => void;
  setBackgroundColor: (backgroundColor: string) => void;
  setCurrentCfi: (cfi: string) => void;
  setFontSize: (size: number) => void; // 新增：设置字体大小的方法
}

const BG_STORAGE_KEY = 'READ_BACKGROUND_COLOR_KEY';
const POSITION_STORAGE_KEY = 'READ_POSITION_KEY';
const FONT_SIZE_STORAGE_KEY = 'READ_FONT_SIZE_KEY'; // 新增：字体大小的存储 Key

const DEFAULT_BG = '#ffffff';
const DEFAULT_FONT_SIZE = 16; // 默认字体大小

const getInitialBg = () => {
  try {
    return localStorage.getItem(BG_STORAGE_KEY) || DEFAULT_BG;
  } catch {
    return DEFAULT_BG;
  }
};

const getInitialCfi = () => {
  try {
    return localStorage.getItem(POSITION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

// 新增：获取初始字体大小
const getInitialFontSize = () => {
  try {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
};

const [state, setState] = createStore({
  height: 0,
  backgroundColor: getInitialBg(),
  currentCfi: getInitialCfi(),
  fontSize: getInitialFontSize(), // 新增：初始化状态
});

export const useStore2 = {
  get height() {
    return state.height;
  },
  get backgroundColor() {
    return state.backgroundColor;
  },
  get currentCfi() {
    return state.currentCfi;
  },
  get fontSize() { // 新增：getter
    return state.fontSize;
  },
  setHeight: (height: number) => {
    setState("height", height);
  },
  setBackgroundColor: (backgroundColor: string) => {
    try {
      localStorage.setItem(BG_STORAGE_KEY, backgroundColor);
    } catch {}
    setState("backgroundColor", backgroundColor);
  },
  setCurrentCfi: (currentCfi: string) => {
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, currentCfi);
    } catch {}
    setState("currentCfi", currentCfi);
  },
  // 新增：设置字体大小并同步到 localStorage 和你的阅读器实例
  setFontSize: (size: number, instance?: any) => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, size.toString());
    } catch {}
    setState("fontSize", size);

    // 如果顺便传了阅读器实例，可以直接在这里调用你的修改逻辑
    if (instance) {
      instance.themes.fontSize(`${size}px`);
    }
  },
};