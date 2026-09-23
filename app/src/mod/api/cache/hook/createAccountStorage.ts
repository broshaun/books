import { createSignal } from "solid-js";

const STORAGE_KEY = "account_map";

export type AccountMap<TUser> = Record<string, TUser>;

export interface SetUserParams<TUser> {
  account: string;
  user: TUser;
}

function readMap<TUser>(): AccountMap<TUser> {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export function createAccountStorage<TUser = any>() {
  const [map, setMap] = createSignal<AccountMap<TUser>>(readMap());

  const persist = (next: AccountMap<TUser>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMap(next);
  };

  return {
    // 获取响应式状态本身（可选）
    map,
    
    // 获取指定账号
    get: (account: string): TUser | null => {
      const key = account.trim();
      return key ? map()[key] ?? null : null;
    },

    // 设置/新增账号
    set: ({ account, user }: SetUserParams<TUser>) => {
      const key = account.trim();
      if (!key) return;
      persist({ ...map(), [key]: user });
    },

    // 移除指定账号
    remove: (account: string) => {
      const key = account.trim();
      const current = map();
      if (!key || !(key in current)) return;

      const next = { ...current };
      delete next[key];
      persist(next);
    },

    // 清空所有账号
    clear: () => {
      localStorage.removeItem(STORAGE_KEY);
      setMap({});
    },
  };
}