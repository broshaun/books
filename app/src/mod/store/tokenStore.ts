import { createStore } from "solid-js/store";

export interface TokenState {
  token: string;
  expired: number;
}

export interface TokenStoreActions {
  set: (token: string, expired: number | string) => void;
  get: () => string | null;
  clear: () => void;
}

export type TokenStoreInstance = TokenState & TokenStoreActions;

const STORAGE_KEY = "token";
const MAX_TIMEOUT = 2_147_483_647;
let expireTimer: ReturnType<typeof setTimeout> | null = null;

const stopExpireTimer = () => {
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
};

const parseExpired = (expired: number | string): number => {
  if (typeof expired === "number") return Number.isFinite(expired) ? expired : 0;
  const ts = new Date(expired).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const getPersistedData = (): TokenState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: "", expired: 0 };
    const parsed = JSON.parse(raw);
    return {
      token: typeof parsed?.token === "string" ? parsed.token : "",
      expired: typeof parsed?.expired === "number" ? parsed.expired : 0,
    };
  } catch {
    return { token: "", expired: 0 };
  }
};

const savePersistedData = (state: TokenState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const initial = getPersistedData();

const [store, setStore] = createStore<TokenState>(initial);

const clear = () => {
  stopExpireTimer();
  if (store.token || store.expired !== 0) {
    setStore({ token: "", expired: 0 });
    localStorage.removeItem(STORAGE_KEY);
  }
};

const startExpireTimer = (expiredTs: number) => {
  stopExpireTimer();
  const schedule = () => {
    const remain = expiredTs - Date.now();
    if (remain <= 0) return clear();
    expireTimer = setTimeout(schedule, Math.min(remain, MAX_TIMEOUT));
  };
  schedule();
};

const set = (tokenRaw: string, expiredInput: number | string) => {
  const token = tokenRaw.trim();
  const expired = parseExpired(expiredInput);

  if (!token || expired <= Date.now()) {
    clear();
    return;
  }

  startExpireTimer(expired);
  setStore({ token, expired });
  savePersistedData({ token, expired });
};

const get = (): string | null => {
  if (!store.token || store.expired <= Date.now()) {
    clear();
    return null;
  }
  return store.token;
};

if (initial.token && initial.expired > Date.now()) {
  startExpireTimer(initial.expired);
} else {
  clear();
}

export const tokenStore: TokenStoreInstance = {
  get token() { return store.token; },
  get expired() { return store.expired; },
  set,
  get,
  clear,
};