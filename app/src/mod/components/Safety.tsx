import { createSignal, Show } from "solid-js";
import { IconCheck, IconLoader2 } from "@tabler/icons-solidjs";

export interface SafetyProps {
  initialTop?: number;
  initialBottom?: number;
  onConfirm?: (values: { top: number; bottom: number }) => void | Promise<void>;
}

export function Safety(props: SafetyProps) {
  const [top, setTop] = createSignal(props.initialTop ?? 20);
  const [bottom, setBottom] = createSignal(props.initialBottom ?? 20);
  const [loading, setLoading] = createSignal(false); // 👈 新增：加载状态控制

  const updateTop = (val: number) => setTop(Math.max(0, val));
  const updateBottom = (val: number) => setBottom(Math.max(0, val));

  const handleConfirm = async () => {
    if (loading() || !props.onConfirm) return;
    try {
      setLoading(true);
      await props.onConfirm({ top: top(), bottom: bottom() });
    } catch (error) {
      console.error("保存安全区域失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 渲染单组调节器
  const renderControlGroup = (
    label: string, 
    value: number, 
    onUpdate: (v: number) => void
  ) => (
    <div class="flex flex-col gap-1.5 w-full">
      <div class="flex items-center justify-between text-xs">
        <span class="font-medium text-slate-700">{label}</span>
        <span class="font-mono font-bold text-slate-900">{value} px</span>
      </div>
      <div class="grid grid-cols-4 gap-1">
        <button type="button" disabled={loading()} onClick={() => onUpdate(value - 10)} class="py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50">-10</button>
        <button type="button" disabled={loading()} onClick={() => onUpdate(value - 1)} class="py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50">-1</button>
        <button type="button" disabled={loading()} onClick={() => onUpdate(value + 1)} class="py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50">+1</button>
        <button type="button" disabled={loading()} onClick={() => onUpdate(value + 10)} class="py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50">+10</button>
      </div>
    </div>
  );

  return (
    <div class="relative w-screen h-screen flex flex-col bg-slate-50 select-none overflow-hidden">
      
      {/* 1. 顶部红色标注区 */}
      <div class="w-full bg-red-500/15 transition-all shrink-0 z-10" style={{ height: `${top()}px` }} />

      {/* 2. 中间主要内容区域 */}
      <div class="flex-1 w-full flex flex-col border-2 border-red-500 box-border bg-white relative overflow-hidden">
        
        {/* 顶部工具栏 */}
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
          <div class="w-6" />
          <span class="text-xs font-semibold text-slate-700">安全显示区域设置</span>
          <button
            type="button"
            disabled={loading()}
            onClick={handleConfirm}
            class="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Show when={loading()} fallback={<IconCheck size={20} />}>
              <IconLoader2 size={20} class="animate-spin" />
            </Show>
          </button>
        </div>

        {/* 核心调节区 */}
        <div class="flex-1 flex flex-col items-center justify-center gap-4 p-3 overflow-y-auto">
          <span class="text-[11px] text-slate-400 text-center">
            请通过下方按钮调整安全显示区域
          </span>

          <div class="flex flex-col gap-3 w-full max-w-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {renderControlGroup("Top 边距", top(), updateTop)}
            <div class="h-[1px] bg-slate-200/80 my-0.5" />
            {renderControlGroup("Bottom 边距", bottom(), updateBottom)}
          </div>
        </div>

      </div>

      {/* 3. 底部红色标注区 */}
      <div class="w-full bg-red-500/15 transition-all shrink-0 z-10" style={{ height: `${bottom()}px` }} />

    </div>
  );
}

export default Safety;