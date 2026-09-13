import { create } from "zustand";
import type { ReactNode } from "react";


export interface AppBarProps {
  Left?: React.ReactNode;
  title: string;
  Right?: React.ReactNode;
}

interface AppBarState extends AppBarProps {
  setTitle: (title: string) => void;
  setLeft: (Left: ReactNode | null) => void;
  setRight: (Right: ReactNode | null) => void;
  clearAppBar: () => void;
}

export const useAppBar = create<AppBarState>((set) => ({
  title: "主页",
  Left: null,
  Right: null,

  setTitle: (title) => set({ title }),
  setLeft: (Left) => set({ Left }),
  setRight: (Right) => set({ Right }),
  clearAppBar: () => set({ title: "", Left: null, Right: null }),
}));

