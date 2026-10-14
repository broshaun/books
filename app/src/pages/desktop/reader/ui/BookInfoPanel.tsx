import { Show, For } from "solid-js";
import { 
  IconUser, 
  IconBook, 
  IconBuilding, 
  IconCalendarEvent, 
  IconLanguage 
} from "@tabler/icons-solidjs";

export interface BookMeta {
  title: string;
  creator: string;
  publisher?: string;
  description?: string;
  language?: string;
  identifier?: string;
  coverUrl?: string | null;
  bookId: string;
  pubdate?: string;
}

interface BookInfoPanelProps {
  meta?: BookMeta | null;
}

// 辅助函数：提取并格式化出版日年月日 (YYYY-MM-DD)
const formatPubDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const match = dateStr.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
  return match ? match[0].replace(/\//g, '-') : dateStr;
};

export function BookInfoPanel(props: BookInfoPanelProps) {
  const m = () => props.meta;

  const metaItems = () => [
    { icon: IconUser, label: "作者", value: m()?.creator },
    { icon: IconBuilding, label: "出版社", value: m()?.publisher },
    { icon: IconCalendarEvent, label: "出版日", value: formatPubDate(m()?.pubdate) },
    { icon: IconLanguage, label: "语言", value: m()?.language?.toUpperCase() },
  ].filter((item) => item.value);

  return (
    <div class="w-full bg-transparent flex flex-col gap-3.5 text-stone-900 text-xs px-2 py-3 select-none">
      {/* 封面展示区 */}
      <div class="w-full flex justify-center py-1">
        <Show
          when={m()?.coverUrl}
          fallback={
            <div class="w-28 aspect-[3/4] rounded-lg bg-stone-200 border border-stone-300 flex flex-col items-center justify-center text-stone-700 gap-2 shadow-sm">
              <IconBook size={32} class="opacity-80 stroke-[1.5]" />
              <span class="text-[10px] font-bold tracking-wide">暂无封面</span>
            </div>
          }
        >
          <img
            src={m()!.coverUrl!}
            alt={m()?.title || "封面"}
            class="w-28 aspect-[3/4] object-cover rounded-lg shadow-xl shadow-stone-400/40 border border-stone-300"
          />
        </Show>
      </div>

      {/* 书名 */}
      <div class="px-1 text-center">
        <h2 class="text-sm font-extrabold tracking-tight text-stone-950 truncate" title={m()?.title}>
          {m()?.title || "未知书名"}
        </h2>
      </div>

      <div class="w-full h-px bg-stone-300 my-0.5" />

      {/* 核心元数据列表 */}
      <div class="flex flex-col gap-2.5 text-[11px] px-1 font-medium">
        <For each={metaItems()}>
          {(item) => {
            const Icon = item.icon;
            return (
              <div class="flex items-center gap-2 text-stone-900">
                <Icon size={13} class="shrink-0 text-stone-600" />
                <span class="font-bold text-stone-700 shrink-0">{item.label}:</span>
                <span class="font-semibold truncate">{item.value}</span>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export default BookInfoPanel;