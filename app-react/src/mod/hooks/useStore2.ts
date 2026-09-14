import { create } from "zustand";

interface StoreState {
    height: number;
    setHeight: (height: number) => void;
    backgroundColor: string;
    setBackgroundColor: (backgroundColor: string) => void;
    currentCfi: string;
    setCurrentCfi: (cfi: string) => void;
}

const BG_STORAGE_KEY = 'READ_BACKGROUND_COLOR_KEY';
const POSITION_STORAGE_KEY = 'READ_POSITION_KEY';
const DEFAULT_BG = '#ffffff';

export const useStore2 = create<StoreState>((set) => ({
    height: 0,
    setHeight: (height: number) => set({ height }),
    
    backgroundColor: localStorage.getItem(BG_STORAGE_KEY) || DEFAULT_BG,
    setBackgroundColor: (backgroundColor: string) => {
        localStorage.setItem(BG_STORAGE_KEY, backgroundColor);
        set({ backgroundColor });
    },

    currentCfi: localStorage.getItem(POSITION_STORAGE_KEY) || '',
    setCurrentCfi: (currentCfi: string) => {
        localStorage.setItem(POSITION_STORAGE_KEY, currentCfi);
        set({ currentCfi });
    },
}));