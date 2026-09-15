import { createSignal, For } from 'solid-js';
import { IconMinus, IconPlus, IconCheck } from '@tabler/icons-solidjs';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
}

export const READER_THEMES: ThemeOption[] = [
  { id: 'default', name: '默认白', bg: '#ffffff' },
  { id: 'sepia', name: '羊皮纸', bg: '#f4ebd9' },
  { id: 'eye-green', name: '护眼绿', bg: '#c7edcc' },
  { id: 'gray', name: '优雅灰', bg: '#e9ecef' },
];

const DEFAULT_CONFIG = { FONT_SIZE: 18, THEME: 'default' };
const STORAGE_KEYS = { FONT_SIZE: 'READ_FONT_SIZE_KEY', THEME: 'READ_THEME_KEY' };

// 局部组件：主题按钮
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
      <span class="text-xs text-slate-400">{props.theme.name}</span>
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
  // 🌟 修改点：直接传入执行后的初始值，避免 TS 将其推断为函数类型
  const savedFontSize = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FONT_SIZE) : null;
  const [fontSize, setFontSize] = createSignal<number>(
    savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_CONFIG.FONT_SIZE
  );

  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.THEME) : null;
  const [currentTheme, setCurrentTheme] = createSignal<string>(
    savedTheme || DEFAULT_CONFIG.THEME
  );

  // 修改字号
  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.min(Math.max(fontSize() + delta, 12), 32);
    setFontSize(nextSize);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, `${nextSize}`);
    props.onFontSizeChange?.(nextSize);
  };

  // 修改主题与背景色
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
        class={`fixed inset-0 bg-black/40 z-45 transition-opacity duration-300 ease-in-out ${
          props.opened
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={props.onClose}
      />

      {/* 2. 抽屉主体（宽度 320px，右侧滑出） */}
      <div
        class={`fixed inset-y-0 right-0 z-50 w-[320px] max-w-full bg-white dark:bg-zinc-900 shadow-xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${
          props.opened ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 顶部标题栏 */}
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <span class="font-semibold text-base text-slate-800 dark:text-slate-100">
            阅读设置
          </span>
          <button
            type="button"
            onClick={props.onClose}
            class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            关闭
          </button>
        </div>

        {/* 内容区 */}
        <div class="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 字号控制 */}
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              字号控制
            </span>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                字号大小
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(-1)}
                  disabled={fontSize() <= 12}
                  class="p-1.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <IconMinus size={16} />
                </button>
                <span class="text-sm font-semibold text-center w-[45px] text-slate-800 dark:text-slate-100">
                  {fontSize()}px
                </span>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(1)}
                  disabled={fontSize() >= 32}
                  class="p-1.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>
          </div>

          <hr class="border-slate-200 dark:border-zinc-800 my-2" />

          {/* 主题背景 */}
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
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