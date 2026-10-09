import { type Component, For, createSignal, onMount } from "solid-js";
import { readDir } from "@tauri-apps/plugin-fs";
import { homeDir, documentDir, join, dirname } from "@tauri-apps/api/path";
import { IconArrowBackUp, IconFolder, IconCheck, IconX } from "@tabler/icons-solidjs";
import Dialog from "corvu/dialog";

interface FolderSelectorProps {
  opened: boolean;
  onClose?: () => void;
  onConfirm?: (path: string) => void;
}

const FolderSelector: Component<FolderSelectorProps> = (props) => {
  const [path, setPath] = createSignal("");
  const [entries, setEntries] = createSignal<{ name: string; isDirectory: boolean }[]>([]);

  // 加载目录
  const loadDir = async (target: string) => {
    if (!target) return;
    try {
      const res = (await readDir(target)) as { name: string; isDirectory: boolean }[];
      setEntries(res.filter(e => e.isDirectory && !e.name.startsWith(".")));
      setPath(target);
    } catch (e) {
      console.error(`打开目录失败: ${target}`, e);
    }
  };

  onMount(async () => {
    try {
      await loadDir((await documentDir()) || (await homeDir()));
    } catch {
      // 降级兜底
    }
  });

  const btnStyle = {
    flex: 1, padding: "12px", display: "flex", "align-items": "center", "justify-content": "center",
    gap: "6px", "border-radius": "8px", cursor: "pointer", "font-weight": "500"
  };

  const itemStyle = {
    cursor: "pointer", padding: "12px 14px", display: "flex", "align-items": "center", 
    gap: "10px", "border-bottom": "1px solid #f3f4f6"
  };

  return (
    <Dialog open={props.opened} onOpenChange={(open) => !open && props.onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", "z-index": 100, "backdrop-filter": "blur(2px)" }} />
        
        <Dialog.Content style={{
          position: "fixed", bottom: 0, left: 0, right: 0, "max-height": "85vh",
          background: "#fff", "border-radius": "16px 16px 0 0", padding: "16px",
          display: "flex", "flex-direction": "column", gap: "12px", "z-index": 101, outline: "none",
          "-webkit-tap-highlight-color": "transparent"
        }}>
          {/* 标题 */}
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
            <span style={{ "font-weight": "600", "font-size": "16px", color: "#1f2937" }}>选择文件夹</span>
            <Dialog.Close style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px" }}>
              <IconX size={20} />
            </Dialog.Close>
          </div>

          {/* 路径栏 */}
          <div style={{ "font-size": "12px", color: "#666", background: "#f3f4f6", padding: "8px 10px", "border-radius": "6px", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
            {path()}
          </div>

          {/* 列表 */}
          <div style={{ flex: 1, "max-height": "320px", "overflow-y": "auto", border: "1px solid #e5e7eb", "border-radius": "8px", "-webkit-overflow-scrolling": "touch" }}>
            <ul style={{ "list-style": "none", padding: 0, margin: 0 }}>
              <li style={{ ...itemStyle, color: "#4b5563", background: "#fafafa" }} onClick={async () => loadDir(await dirname(path()))}>
                <IconArrowBackUp size={20} /> <span>..</span>
              </li>
              <For each={entries()}>
                {(e) => (
                  <li style={{ ...itemStyle, color: "#2563eb" }} onClick={async () => loadDir(await join(path(), e.name))}>
                    <IconFolder size={20} />
                    <span style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>{e.name}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>

          {/* 底部按钮 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => props.onClose?.()} style={{ ...btnStyle, background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151" }}>
              <IconX size={18} /> 取消
            </button>
            <button onClick={() => { props.onConfirm?.(path()); props.onClose?.(); }} style={{ ...btnStyle, background: "#2563eb", color: "#fff", border: "none" }}>
              <IconCheck size={18} /> 确定
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default FolderSelector;