import { create } from "zustand";
import { persist } from "zustand/middleware";


interface StoreState {

    bottom: number;
    setBottom: (bottom: number) => void;

    top: number;
    setTop: (top: number) => void;
}


export const useSafety = create<StoreState>()(
    persist(
        (set) => ({
        
            bottom: 0,
            setBottom: (bottom) => set({ bottom }),

            top: 0,
            setTop: (top) => set({ top }),
        }),
        {
            name: "safety-config",
        }
    )
);


export const hasSafetyConfig = (): boolean => {
    return localStorage.getItem("safety-config") !== null;
};