import { createSignal, For } from 'solid-js';
import { IconMinus, IconPlus, IconCheck } from '@tabler/icons-solidjs';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  style?: string;
}

export const READER_THEMES: ThemeOption[] = [
  { id: 'default', name: '默认白', bg: '#ffffff' },
  { id: 'sepia', name: '羊皮纸', bg: '#f4ebd9', 
    style: 'background-color: #f6ecd9; background-image: radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0); background-size: 4px 4px;'
   },
  { id: 'eye-green', name: '护眼绿', bg: '#c7edcc' },
  { id: 'gray', name: '优雅灰', bg: '#e9ecef' },
];

const DEFAULT_CONFIG = { FONT_SIZE: 18, THEME: 'default' };
const STORAGE_KEYS = { FONT_SIZE: 'READ_FONT_SIZE_KEY', THEME: 'READ_THEME_KEY' };

function ThemeOptionItem(props: {
  theme: ThemeOption;
  isSelected: boolean;
  onSelect: (id: string, theme: ThemeOption) => void;
}) {
  return (
    <div class="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => props.onSelect(props.theme.id, props.theme)}
        aria-label={props.theme.name}
        class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-xs"
        style={{
          'background-color': props.theme.bg,
          border: props.isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
        }}
      >
        {props.isSelected && <IconCheck size={14} class="text-blue-500" />}
      </button>
      {/* 增强主题名称的文字对比度 */}
      <span class="text-xs font-medium text-stone-700 dark:text-stone-300">{props.theme.name}</span>
    </div>
  );
}

export interface EpubStyleDrawerProps {
  opened: boolean;
  onClose: () => void;
  onFontSizeChange?: (size: number) => void;
  onBackgroundColorChange?: (backgroundColor: string) => void;
}

export function EpubStyleDrawer(props: EpubStyleDrawerProps) {
  const savedFontSize = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FONT_SIZE) : null;
  const [fontSize, setFontSize] = createSignal<number>(
    savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_CONFIG.FONT_SIZE
  );

  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.THEME) : null;
  const [currentTheme, setCurrentTheme] = createSignal<string>(
    savedTheme || DEFAULT_CONFIG.THEME
  );

  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.min(Math.max(fontSize() + delta, 12), 32);
    setFontSize(nextSize);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, `${nextSize}`);
    props.onFontSizeChange?.(nextSize);
  };

  const handleThemeChange = (themeId: string) => {
    const activeTheme = READER_THEMES.find((t) => t.id === themeId) || READER_THEMES[0];
    setCurrentTheme(themeId);
    localStorage.setItem(STORAGE_KEYS.THEME, themeId);
    props.onBackgroundColorChange?.(activeTheme.bg);
  };

  return (
    <>
      {/* 1. 遮罩层 */}
      <div
        class={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-45 transition-opacity duration-300 ease-in-out ${
          props.opened
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={props.onClose}
      />

      {/* 2. 抽屉主体：保持毛玻璃背景，且带有 pt-12 向下偏移 */}
      <div
        class={`fixed inset-y-0 right-0 z-50 w-[320px] max-w-full shadow-2xl shadow-stone-900/20 border-l border-stone-200/80 dark:border-zinc-800/80 flex flex-col pt-12 px-4 pb-4 transform transition-transform duration-300 ease-in-out backdrop-blur-xl bg-inherit/95 ${
          props.opened ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 顶部标题栏 */}
        <div class="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-zinc-800/60">
          <span class="font-bold text-base text-stone-900 dark:text-stone-50">
            阅读设置
          </span>
          <button
            type="button"
            onClick={props.onClose}
            class="text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 cursor-pointer px-2 py-1 rounded-md transition-colors"
          >
            关闭
          </button>
        </div>

        {/* 内容区 */}
        <div class="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 字号控制 */}
          <div class="space-y-2">
            <span class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              字号控制
            </span>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-stone-800 dark:text-stone-200">
                字号大小
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(-1)}
                  disabled={fontSize() <= 12}
                  class="p-1.5 rounded border border-stone-300 dark:border-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-stone-800 dark:text-stone-200 transition-colors"
                >
                  <IconMinus size={16} />
                </button>
                <span class="text-sm font-bold text-center w-[45px] text-stone-900 dark:text-stone-50">
                  {fontSize()}px
                </span>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(1)}
                  disabled={fontSize() >= 32}
                  class="p-1.5 rounded border border-stone-300 dark:border-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-stone-800 dark:text-stone-200 transition-colors"
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>
          </div>

          <hr class="border-stone-200/80 dark:border-zinc-800 my-2" />

          {/* 主题背景 */}
          <div class="space-y-2">
            <span class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              主题背景
            </span>
            <div class="flex items-center justify-between px-1">
              <For each={READER_THEMES}>
                {(theme) => (
                  <ThemeOptionItem
                    theme={theme}
                    isSelected={currentTheme() === theme.id}
                    onSelect={handleThemeChange}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EpubStyleDrawer;