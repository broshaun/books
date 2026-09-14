import { createStore } from "solid-js/store";

interface StoreState {
  bottom: number;
  top: number;
}

interface SafetyStore extends StoreState {
  setBottom: (bottom: number) => void;
  setTop: (top: number) => void;
}

const STORAGE_KEY = "safety-config";

const getInitialState = (): StoreState => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      const data = parsed?.state ?? parsed;
      return {
        bottom: typeof data.bottom === "number" ? data.bottom : 0,
        top: typeof data.top === "number" ? data.top : 0,
      };
    }
  } catch {}
  return { bottom: 0, top: 0 };
};

const [state, setState] = createStore<StoreState>(getInitialState());

const saveToPersist = (newState: StoreState) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: newState, version: 0 })
    );
  } catch {}
};

export const useSafety = (): SafetyStore => ({
  get bottom() {
    return state.bottom;
  },
  get top() {
    return state.top;
  },
  setBottom: (bottom: number) => {
    setState("bottom", bottom);
    saveToPersist({ ...state, bottom });
  },
  setTop: (top: number) => {
    setState("top", top);
    saveToPersist({ ...state, top });
  },
});

export const hasSafetyConfig = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};