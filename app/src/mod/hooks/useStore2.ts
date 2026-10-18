
import { createStore } from "solid-js/store";

export interface StoreState {
  width: number;
  height: number;
  backgroundColor: string;
  currentCfi: string;
  fontSize: number;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setBackgroundColor: (backgroundColor: string) => void;
  setCurrentCfi: (cfi: string) => void;
  setFontSize: (size: number) => void;
}

const BG_STORAGE_KEY = "READ_BACKGROUND_COLOR_KEY";
const POSITION_STORAGE_KEY = "READ_POSITION_KEY";
const FONT_SIZE_STORAGE_KEY = "READ_FONT_SIZE_KEY";

const DEFAULT_BG = "#ffffff";
const DEFAULT_FONT_SIZE = 16;

const getInitialBg = () => {
  try {
    return localStorage.getItem(BG_STORAGE_KEY) || DEFAULT_BG;
  } catch {
    return DEFAULT_BG;
  }
};

const getInitialCfi = () => {
  try {
    return localStorage.getItem(POSITION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const getInitialFontSize = () => {
  try {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
};

const [state, setState] = createStore({
  width: 0,
  height: 0,
  backgroundColor: getInitialBg(),
  currentCfi: getInitialCfi(),
  fontSize: getInitialFontSize(),
});

export const useStore2 = {
  get width() {
    return state.width;
  },
  get height() {
    return state.height;
  },
  get backgroundColor() {
    return state.backgroundColor;
  },
  get currentCfi() {
    return state.currentCfi;
  },
  get fontSize() {
    return state.fontSize;
  },

  setWidth: (width: number) => {
    setState("width", width);
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

 setFontSize: (size: number) => {
  const nextSize = Math.max(12, Math.min(32, size));

  try {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(nextSize));
  } catch {}

  setState("fontSize", nextSize);
},
};
