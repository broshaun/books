import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ==================== 类型定义 ====================
interface TokenStore {
  token: string;
  expired: number;
  /** 设置token与过期时间（支持时间戳数字/日期字符串） */
  set: (token: string, expired: number | string) => void;
  /** 获取有效token，过期自动清空返回null */
  get: () => string | null;
  /** 清空token并销毁过期定时器 */
  clear: () => void;
}

// ==================== 全局定时器状态 ====================
const MAX_TIMEOUT = 2_147_483_647;
let expireTimer: ReturnType<typeof setTimeout> | null = null;

// 停止过期倒计时
const stopExpireTimer = () => {
  if (!expireTimer) return;
  clearTimeout(expireTimer);
  expireTimer = null;
};

// 统一解析过期时间为毫秒时间戳，非法值返回0
const parseExpired = (expired: number | string): number => {
  if (typeof expired === "number") return Number.isFinite(expired) ? expired : 0;
  const ts = new Date(expired).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

// ==================== Zustand Store ====================
export const tokenStore = create<TokenStore>()(
  persist(
    (set, get) => {
      // 清空token、重置过期时间、销毁定时器
      const clearToken = () => {
        stopExpireTimer();
        const state = get();
        if (!state.token && state.expired === 0) return;
        set({ token: "", expired: 0 });
      };

      // 启动过期倒计时，时间到自动清空
      const startExpireTimer = (expiredTs: number) => {
        stopExpireTimer();
        const schedule = () => {
          const remain = expiredTs - Date.now();
          if (remain <= 0) return clearToken();
          expireTimer = setTimeout(schedule, Math.min(remain, MAX_TIMEOUT));
        };
        schedule();
      };

      return {
        token: "",
        expired: 0,

        set(tokenRaw: string, expiredInput: number | string) {
          const token = tokenRaw.trim();
          const expiredTs = parseExpired(expiredInput);
          // 空token / 已过期 → 直接清空
          if (!token || expiredTs <= Date.now()) return clearToken();
          set({ token, expired: expiredTs });
          startExpireTimer(expiredTs);
        },

        get() {
          const { token, expired } = get();
          // 无token / 已过期 → 清空并返回null
          if (!token || expired <= Date.now()) {
            clearToken();
            return null;
          }
          return token;
        },

        clear: clearToken,
      };
    },
    {
      name: "token",
      storage: createJSONStorage(() => localStorage),
      // 持久化只存储两个字段
      partialize: ({ token, expired }) => ({ token, expired }),
      // 本地缓存恢复完成后重启过期定时器
      onRehydrateStorage: () => (state, err) => {
        if (err) return tokenStore.getState().clear();
        if (!state?.token) return;
        state.set(state.token, state.expired);
      },
    },
  ),
);

export type { TokenStore };