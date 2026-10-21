// hooks/useTheme.ts
import { createSignal, onMount } from "solid-js";

const STORAGE_KEY = 'app-theme-mode';

export type ThemeMode = 'default' | 'sepia' | 'eye-green' | 'gray';

export function useTheme() {
  const [theme, setTheme] = createSignal<ThemeMode>('default');

  onMount(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode;
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  });

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;

    // 移除所有的主题类名
    root.classList.remove('theme-sepia', 'theme-eye-green', 'theme-gray');

    // 当非 default 时追加 `theme-${mode}`
    if (mode !== 'default') {
      root.classList.add(`theme-${mode}`);
    }

    setTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return {
    theme,
    setTheme: applyTheme,
  };
}