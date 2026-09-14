import { createStore } from "solid-js/store";

export interface StoreState {
  height: number;
  backgroundColor: string;
  currentCfi: string;
  setHeight: (height: number) => void;
  setBackgroundColor: (backgroundColor: string) => void;
  setCurrentCfi: (cfi: string) => void;
}

const BG_STORAGE_KEY = 'READ_BACKGROUND_COLOR_KEY';
const POSITION_STORAGE_KEY = 'READ_POSITION_KEY';
const DEFAULT_BG = '#ffffff';

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

const [state, setState] = createStore({
  height: 0,
  backgroundColor: getInitialBg(),
  currentCfi: getInitialCfi(),
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
};