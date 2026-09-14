import { createStore } from "solid-js/store";
import type { JSX } from "solid-js";

export interface AppBarProps {
  Left?: JSX.Element | null;
  title: string;
  Right?: JSX.Element | null;
}

interface AppBarState extends AppBarProps {
  setTitle: (title: string) => void;
  setLeft: (Left: JSX.Element | null) => void;
  setRight: (Right: JSX.Element | null) => void;
  clearAppBar: () => void;
}

const [state, setState] = createStore<AppBarProps>({
  title: "主页",
  Left: null,
  Right: null,
});

const setTitle = (title: string) => {
  setState("title", title);
};

const setLeft = (Left: JSX.Element | null) => {
  setState("Left", Left);
};

const setRight = (Right: JSX.Element | null) => {
  setState("Right", Right);
};

const clearAppBar = () => {
  setState({ title: "", Left: null, Right: null });
};

export const useAppBar = (): AppBarState => ({
  get title() { return state.title; },
  get Left() { return state.Left; },
  get Right() { return state.Right; },
  setTitle,
  setLeft,
  setRight,
  clearAppBar,
});