import { createStore } from "solid-js/store";
import type { JSX } from "solid-js";

const [state, setState] = createStore({
  title: "主页",
  left: null as JSX.Element | null,
  right: null as JSX.Element | null,
});

export const appBarStore = {
  get title() { return state.title; },
  get left() { return state.left; },
  get right() { return state.right; },

  // 一句话更新全部或部分
  set: (payload: { title?: string; left?: JSX.Element | null; right?: JSX.Element | null }) => {
    setState(payload);
  },
  
  // 重置/清除
  clear: () => setState({ title: "", left: null, right: null }),
};