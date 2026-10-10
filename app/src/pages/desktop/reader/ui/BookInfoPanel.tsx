import { Show, For, createResource } from "solid-js";
import { 
  IconUser, 
  IconBook, 
  IconBuilding, 
  IconCalendarEvent, 
  IconLanguage 
} from "@tabler/icons-solidjs";

interface BookInfoPanelProps {
  book?: any;
}

// 辅助函数：提取并格式化出版日年月日 (YYYY-MM-DD)
const formatPubDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const match = dateStr.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
  return match ? match[0].replace(/\//g, '-') : dateStr;
};

export function BookInfoPanel(props: BookInfoPanelProps) {
  const metadata = () => props.book?.packaging?.metadata || {};

  // 封面获取逻辑
  const [coverUrl, { mutate: setCoverUrl }] = createResource(
    () => props.book,
    async (book) => {
      if (!book) return null;
      try {
        if (typeof book.coverUrl === "function") {
          const url = await book.coverUrl();
          if (url) return url;
        }
        if (typeof book.getCover === "function") {
          const res = await book.getCover();
          if (res instanceof Blob) return URL.createObjectURL(res);
          if (typeof res === "string") return res;
        }
        if (book.cover) {
          return book.cover instanceof Blob ? URL.createObjectURL(book.cover) : book.cover;
        }
      } catch (e) {
        console.warn("加载封面失败", e);
      }
      return null;
    }
  );

  // 统一管理元数据项，方便循环渲染
  const metaItems = () => [
    { icon: IconUser, label: "作者", value: metadata().creator },
    { icon: IconBuilding, label: "出版社", value: metadata().publisher },
    { icon: IconCalendarEvent, label: "出版日", value: formatPubDate(metadata().pubdate) },
    { icon: IconLanguage, label: "语言", value: metadata().language?.toUpperCase() },
  ].filter((item) => item.value);

  return (
    <div class="w-full bg-transparent flex flex-col gap-3.5 text-stone-900 text-xs px-2 py-3 select-none">
      {/* 封面展示区 */}
      <div class="w-full flex justify-center py-1">
        <Show
          when={coverUrl()}
          fallback={
            <div class="w-28 aspect-[3/4] rounded-lg bg-stone-200 border border-stone-300 flex flex-col items-center justify-center text-stone-700 gap-2 shadow-sm">
              <IconBook size={32} class="opacity-80 stroke-[1.5]" />
              <span class="text-[10px] font-bold tracking-wide">暂无封面</span>
            </div>
          }
        >
          <img
            src={coverUrl()!}
            alt={metadata().title}
            onError={() => setCoverUrl(null)}
            class="w-28 aspect-[3/4] object-cover rounded-lg shadow-xl shadow-stone-400/40 border border-stone-300"
          />
        </Show>
      </div>

      {/* 单行书名（超出显示省略号，并带有完整标题提示） */}
      <div class="px-1 text-center">
        <h2 class="text-sm font-extrabold tracking-tight text-stone-950 truncate" title={metadata().title}>
          {metadata().title || "未知书名"}
        </h2>
      </div>

      <div class="w-full h-px bg-stone-300 my-0.5" />

      {/* 核心元数据单列列表（循环渲染） */}
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