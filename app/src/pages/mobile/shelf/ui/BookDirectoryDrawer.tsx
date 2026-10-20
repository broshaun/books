import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import Dialog from "corvu/dialog";
import {
  IconFolder,
  IconFolderPlus,
  IconUserCircle,
  IconInfoCircle,
  IconTrash,
  IconEdit,
  IconX,
  IconDotsVertical,
  IconBook,
} from "@tabler/icons-solidjs";

export interface FolderItem { id: number; name: string }
export interface LocalBook { name: string; path: string; folder?: string | null }

export interface BookDirectoryDrawerProps {
  opened: boolean;
  onClose?: () => void;
  folders?: FolderItem[];
  books?: LocalBook[];
  onSelectFolder?: (folder: { id: number | null; name: string | null }) => void;
  onAddFolder?: (name: string) => void;
  onDelFolder?: (name: string) => void;
  onUpdateFolder?: (oldName: string, newName: string) => void;
  onAddEpub?: (filePath: string, folderName?: string | null) => void;
  onDelBook?: (bookName: string) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  let drawerRef!: HTMLDivElement;
  const [folderInputOpen, setFolderInputOpen] = createSignal(false);
  const [folderNameInput, setFolderNameInput] = createSignal("");
  const [editingFolder, setEditingFolder] = createSignal<string | null>(null);
  const [editFolderNameInput, setEditFolderNameInput] = createSignal("");
  const [activeMenuFolder, setActiveMenuFolder] = createSignal<string | null>(null);
  const [confirmDelFolder, setConfirmDelFolder] = createSignal<string | null>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (folderInputOpen() || confirmDelFolder() || editingFolder()) return;
    if (props.opened && drawerRef && !drawerRef.contains(e.target as Node)) {
      props.onClose?.();
      setActiveMenuFolder(null);
    }
  };

  onMount(() => document.addEventListener("mousedown", handleClickOutside));
  onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));

  const handleAddEpub = async (folderName?: string | null) => {
    try {
      const selected = await openDialog({
        directory: false, multiple: false,
        filters: [{ name: "Epub Books", extensions: ["epub"] }],
        title: folderName ? `添加书籍到 ${folderName}` : "添加书籍",
      });
      if (typeof selected === "string") props.onAddEpub?.(selected, folderName);
    } catch (e) { console.error(e); }
  };

  const hasBottom = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 💡 优化后的遮罩层：柔和半透明黑 + 景深模糊，消除生硬的方形阴影感 */}
      <div
        class={`absolute inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          "backdrop-filter": "blur(4px)",
          "-webkit-backdrop-filter": "blur(4px)",
        }}
        onClick={() => { props.onClose?.(); setActiveMenuFolder(null); }}
      />

      {/* 抽屉主体：自动关联全局主题背景色与文字颜色 */}
      <div
        ref={drawerRef}
        class={`absolute inset-y-0 left-0 z-50 w-full max-w-[240px] shadow-xl flex flex-col p-3 pt-12 overflow-hidden transform transition-transform duration-300 border-r ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          "background-color": "var(--bg-header)",
          "color": "var(--text-color)",
          "border-color": "var(--border-color)",
        }}
      >
        <div class="px-1 pb-1 font-semibold text-sm tracking-tight" style={{ color: "inherit" }}>我的书籍</div>
        <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />

        <div class="flex-1 overflow-auto space-y-1">
          <For each={props.folders || []} fallback={<div class="text-xs opacity-50 text-center py-6 select-none">暂无文件夹，请先添加</div>}>
            {(folder) => {
              const isMenuOpen = () => activeMenuFolder() === folder.name;
              return (
                <div class="relative flex items-center w-full px-2.5 py-2 rounded-md transition-colors group/folder hover:opacity-100" style={{ "background-color": isMenuOpen() ? "var(--bg-main)" : "transparent" }}>
                  <button
                    type="button"
                    onClick={() => {
                      props.onClose?.();
                      setActiveMenuFolder(null);
                      setTimeout(() => props.onSelectFolder?.(folder), 150);
                    }}
                    class="flex items-center gap-2.5 flex-1 text-left cursor-pointer bg-transparent border-none outline-none p-0 overflow-hidden select-none"
                    style={{ color: "inherit" }}
                  >
                    <IconFolder size={16} class="opacity-70 shrink-0" />
                    <span class="text-xs font-medium truncate opacity-90 group-hover/folder:opacity-100" style={{ color: "inherit" }}>{folder.name}</span>
                  </button>

                  <div class="relative folder-menu-container">
                    <button
                      type="button"
                      title="更多操作"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuFolder(isMenuOpen() ? null : folder.name);
                      }}
                      class="opacity-60 hover:opacity-100 p-1 bg-transparent border-none cursor-pointer outline-none transition-opacity"
                      style={{ color: "inherit" }}
                    >
                      <IconDotsVertical size={14} />
                    </button>

                    <Show when={isMenuOpen()}>
                      <div 
                        class="absolute right-0 top-full mt-1 w-32 rounded-lg shadow-2xl z-50 p-1 flex flex-col gap-0.5 select-none border"
                        style={{
                          "background-color": "var(--bg-header)",
                          "color": "var(--text-color)",
                          "border-color": "var(--border-color)",
                        }}
                      >
                        <MenuBtn icon={<IconBook size={13} class="opacity-70" />} label="添加书籍" onClick={() => { setActiveMenuFolder(null); handleAddEpub(folder.name); }} />
                        <MenuBtn icon={<IconEdit size={13} class="opacity-70" />} label="修改名称" onClick={() => { setActiveMenuFolder(null); setEditFolderNameInput(folder.name); setEditingFolder(folder.name); }} />
                        <MenuBtn icon={<IconTrash size={13} class="text-red-400" />} label="删除文件夹" danger onClick={() => { setActiveMenuFolder(null); setConfirmDelFolder(folder.name); }} />
                      </div>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>

        <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />

        <div class="space-y-1">
          <Btn icon={<IconFolderPlus size={16} class="opacity-70" />} label="新建文件夹" onClick={() => setFolderInputOpen(true)} />
        </div>

        <Show when={hasBottom()}>
          <hr class="my-2 border-0 h-[1px]" style={{ "background-color": "var(--border-color)" }} />
          <div class="space-y-0.5 shrink-0">
            <Show when={props.onOpenProfile}>
              <Btn icon={<IconUserCircle size={16} class="opacity-70" />} label="个人" onClick={() => { props.onClose?.(); setTimeout(() => props.onOpenProfile?.(), 150); }} />
            </Show>
            <Show when={props.onOpenAbout}>
              <Btn icon={<IconInfoCircle size={16} class="opacity-70" />} label="关于" onClick={() => { props.onClose?.(); setTimeout(() => props.onOpenAbout?.(), 150); }} />
            </Show>
          </div>
        </Show>
      </div>

      {/* 新建文件夹弹窗 */}
      <Modal open={folderInputOpen()} onClose={() => setFolderInputOpen(false)} title="新建文件夹">
        <input
          type="text" placeholder="请输入文件夹名称..." value={folderNameInput()}
          onInput={(e) => setFolderNameInput(e.currentTarget.value)}
          class="text-xs px-3 py-2.5 rounded-lg border outline-none w-full transition-colors"
          style={{
            "background-color": "var(--bg-main)",
            "color": "var(--text-color)",
            "border-color": "var(--border-color)",
          }}
          autofocus
        />
        <div class="flex gap-2 pt-1">
          <ModalBtn label="取消" onClick={() => setFolderInputOpen(false)} />
          <ModalBtn primary label="确定" onClick={() => { if (folderNameInput().trim()) { props.onAddFolder?.(folderNameInput().trim()); setFolderNameInput(""); setFolderInputOpen(false); } }} />
        </div>
      </Modal>

      {/* 修改文件夹名弹窗 */}
      <Modal open={!!editingFolder()} onClose={() => setEditingFolder(null)} title="修改文件夹名称">
        <input
          type="text" placeholder="请输入新的文件夹名称..." value={editFolderNameInput()}
          onInput={(e) => setEditFolderNameInput(e.currentTarget.value)}
          class="text-xs px-3 py-2.5 rounded-lg border outline-none w-full transition-colors"
          style={{
            "background-color": "var(--bg-main)",
            "color": "var(--text-color)",
            "border-color": "var(--border-color)",
          }}
          autofocus
        />
        <div class="flex gap-2 pt-1">
          <ModalBtn label="取消" onClick={() => setEditingFolder(null)} />
          <ModalBtn primary label="确定" onClick={() => { const oldName = editingFolder(); const newName = editFolderNameInput().trim(); if (oldName && newName && newName !== oldName) props.onUpdateFolder?.(oldName, newName); setEditingFolder(null); }} />
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={!!confirmDelFolder()} onClose={() => setConfirmDelFolder(null)} title="确认删除">
        <p class="text-xs opacity-90 px-1" style={{ color: "inherit" }}>
          确定要删除文件夹 <span class="font-semibold" style={{ color: "var(--text-color)" }}>“{confirmDelFolder()}”</span> 吗？
        </p>
        <div class="flex gap-2 pt-2">
          <ModalBtn label="取消" onClick={() => setConfirmDelFolder(null)} />
          <ModalBtn primary danger label="确认删除" onClick={() => { const name = confirmDelFolder(); if (name) { props.onDelFolder?.(name); setConfirmDelFolder(null); } }} />
        </div>
      </Modal>
    </>
  );
}

function Btn(p: { icon: any; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={p.onClick} class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:opacity-100 opacity-80 transition-opacity cursor-pointer bg-transparent border-none outline-none" style={{ color: "inherit" }}>
      {p.icon} <span class="text-xs font-medium" style={{ color: "inherit" }}>{p.label}</span>
    </button>
  );
}

function MenuBtn(p: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={p.onClick} class={`flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded transition-colors text-left cursor-pointer border-none bg-transparent outline-none ${p.danger ? 'text-red-400 hover:bg-red-500/10' : 'opacity-80 hover:opacity-100 hover:bg-black/5'}`} style={{ color: p.danger ? undefined : "inherit" }}>
      {p.icon} <span style={{ color: "inherit" }}>{p.label}</span>
    </button>
  );
}

function Modal(p: { open: boolean; onClose: () => void; title: string; children: any }) {
  return (
    <Dialog open={p.open} onOpenChange={(v) => !v && p.onClose()}>
      <Dialog.Portal>
        {/* 💡 对话框遮罩也同步优化，保持视觉一致 */}
        <Dialog.Overlay class="fixed inset-0 bg-black/40 z-50" style={{ "backdrop-filter": "blur(4px)", "-webkit-backdrop-filter": "blur(4px)" }} />
        <Dialog.Content 
          class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[300px] rounded-xl p-4 flex flex-col gap-3 z-50 outline-none shadow-2xl border"
          style={{
            "background-color": "var(--bg-header)",
            "color": "var(--text-color)",
            "border-color": "var(--border-color)",
          }}
        >
          <div class="flex justify-between items-center px-1">
            <span class="font-semibold text-sm" style={{ color: "inherit" }}>{p.title}</span>
            <Dialog.Close class="bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100 p-1 outline-none" style={{ color: "inherit" }}><IconX size={18} /></Dialog.Close>
          </div>
          {p.children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function ModalBtn(p: { label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const getStyle = () => {
    if (p.danger) return { "background-color": "#ef4444", "color": "#ffffff", "border": "none" };
    if (p.primary) return { "background-color": "var(--text-color)", "color": "var(--bg-main)", "border": "none" };
    return { "background-color": "var(--bg-main)", "color": "inherit", "border": "1px solid var(--border-color)" };
  };

  return (
    <button type="button" onClick={p.onClick} class="flex-1 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-opacity hover:opacity-90 outline-none" style={getStyle()}>
      {p.label}
    </button>
  );
}

export default BookDirectoryDrawer;