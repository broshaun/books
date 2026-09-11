import { create } from 'zustand';
import { userId, deviceId } from "@/mod/lib/idStore";
import { apiConfig } from '@/App';
import { tokenStore } from './tokenStore';

// 1. App 核心上下文数据类型（干净利落，不含任何复杂实例）
export interface AppInitData {
    uid: string;
    did: string;
    host: string;
    token: string | null;
}

export interface AppStoreState {
    loading: boolean;
    ready: boolean;
    store: Partial<AppInitData>;
    error: unknown;
}

export interface AppStoreActions {
    initCache: () => Promise<void>;
    getStore: () => Partial<AppInitData>;
    getAsyncStore: () => Promise<AppInitData>;
}

type AppStoreType = AppStoreState & AppStoreActions;

export const useAppStore = create<AppStoreType>((set, get) => {
    return {
        loading: false,
        ready: false,
        store: {},
        error: null,

        initCache: async () => {
            const state = get();
            if (state.ready || state.loading) return;
            try {
                set({ loading: true, error: null });
                const uid = userId.get();
                const did = deviceId.get();
                const host = apiConfig.apiMqtt;
                const token = tokenStore.getState().get();
                set({ store: { uid, did, host, token }, ready: true });
            } catch (err) {
                set({ error: err });
                throw err;
            } finally {
                set({ loading: false });
            }
        },
        getStore: () => get().store,
        getAsyncStore: async () => {
            const state = get();
            if (state.ready) get().store as AppInitData;
            await get().initCache();
            return get().store as AppInitData;
        }
    };
});