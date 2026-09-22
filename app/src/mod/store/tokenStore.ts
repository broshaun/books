import { createStore } from "solid-js/store";

interface TokenState {
  token: string;
  expired: number;
}

const STORAGE_KEY = "token";
let expireTimer: number | null = null;

const loadInitial = (): TokenState => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)!) || { token: "", expired: 0 };
  } catch {
    return { token: "", expired: 0 };
  }
};

const [state, setState] = createStore<TokenState>(loadInitial());

const clear = () => {
  if (expireTimer) clearTimeout(expireTimer);
  expireTimer = null;
  setState({ token: "", expired: 0 });
  localStorage.removeItem(STORAGE_KEY);
};

const setupTimer = (expired: number) => {
  if (expireTimer) clearTimeout(expireTimer);
  const delay = expired - Date.now();
  if (delay <= 0) return clear();
  expireTimer = window.setTimeout(clear, Math.min(delay, 2_147_483_647));
};

if (state.token && state.expired > Date.now()) {
  setupTimer(state.expired);
} else {
  clear();
}

export const tokenStore = {
  get token() { return state.token; },
  get expired() { return state.expired; },

  set(tokenStr: string, expiredInput: number | string) {
    const token = tokenStr.trim();
    const expired = typeof expiredInput === "number" ? expiredInput : new Date(expiredInput).getTime();

    if (!token || expired <= Date.now()) return clear();

    setState({ token, expired });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expired }));
    setupTimer(expired);
  },

  get() {
    if (!state.token || state.expired <= Date.now()) {
      clear();
      return null;
    }
    return state.token;
  },

  clear,
};