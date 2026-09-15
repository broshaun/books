import { createSignal, Show } from 'solid-js';
import {
  IconCopy,
  IconCheck,
  IconEdit,
  IconQuote,
  IconTrash,
} from '@tabler/icons-solidjs';

interface EpubNotesViewProps {
  title?: string;
  subtitleValue?: string;
  note: string;
  onEditClick: () => void;
  onDelete?: () => void;
}

export function EpubNotesView(props: EpubNotesViewProps) {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async () => {
    const text = props.subtitleValue;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <div class="h-full p-3 flex flex-col gap-2 box-border bg-white dark:bg-zinc-900">
      {/* 顶部标题与操作按钮区 */}
      <div class="flex items-center justify-between h-6 gap-2">
        <span class="font-bold text-sm truncate flex-1 text-slate-800 dark:text-slate-100">
          {props.title || '读书笔记'}
        </span>
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={props.onEditClick}
            class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            title="切换为编辑模式"
          >
            <IconEdit size={14} />
          </button>
          <Show when={props.onDelete}>
            <button
              type="button"
              onClick={props.onDelete}
              class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-red-500 cursor-pointer"
              title="删除笔记"
            >
              <IconTrash size={14} />
            </button>
          </Show>
        </div>
      </div>

      {/* 引用内容悬浮栏 */}
      <Show when={props.subtitleValue}>
        <div class="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <IconQuote size={12} class="shrink-0 text-slate-400" />
            <span class="text-xs truncate text-slate-500 dark:text-slate-400 flex-1">
              {props.subtitleValue}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            class="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition-colors text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer"
            title={copied() ? '已复制' : '复制引用'}
          >
            <Show when={copied()} fallback={<IconCopy size={12} />}>
              <IconCheck size={12} class="text-teal-600 dark:text-teal-400" />
            </Show>
          </button>
        </div>
      </Show>

      {/* 笔记正文可滚动展示框 */}
      <div class="flex-1 p-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 overflow-y-auto text-[13px] leading-[1.5] whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">
        <Show
          when={props.note}
          fallback={
            <span class="text-xs text-slate-400">
              暂无内容，点击右上角编辑图标开始编写...
            </span>
          }
        >
          {props.note}
        </Show>
      </div>
    </div>
  );
}

export default EpubNotesView;