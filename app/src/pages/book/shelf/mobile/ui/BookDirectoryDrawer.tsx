import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import Dialog from "corvu/dialog";
import {
  IconFolder,
  IconFolderPlus,
  IconUserCircle,
  IconInfoCircle,
  IconTrash,
  IconX,
  IconDotsVertical,
  IconBook,
} from "@tabler/icons-solidjs";

export interface Tag { id: number; name: string }
export interface LocalBook { name: string; path: string; tagName?: string | null }

export interface BookDirectoryDrawerProps {
  opened: boolean;
  onClose?: () => void;
  tags?: Tag[];
  books?: LocalBook[];
  onSelectTag?: (tag: { id: number | null; name: string | null }) => void;
  onAddTag?: (name: string) => void;
  onDelTag?: (name: string) => void;
  onAddEpub?: (filePath: string, tagName?: string | null) => void;
  onDelBook?: (bookName: string) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
}

export function BookDirectoryDrawer(props: BookDirectoryDrawerProps) {
  let drawerRef!: HTMLDivElement;
  const [tagInputOpen, setTagInputOpen] = createSignal(false);
  const [tagNameInput, setTagNameInput] = createSignal("");
  const [activeMenuTag, setActiveMenuTag] = createSignal<string | null>(null);
  const [confirmDelTag, setConfirmDelTag] = createSignal<string | null>(null);

  // 点击外部收起
  const handleClickOutside = (e: MouseEvent) => {
    if (tagInputOpen() || confirmDelTag()) return;
    if (props.opened && drawerRef && !drawerRef.contains(e.target as Node)) {
      props.onClose?.();
      setActiveMenuTag(null);
    }
  };

  onMount(() => document.addEventListener("mousedown", handleClickOutside));
  onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));

  const handleAddEpub = async (tagName?: string | null) => {
    try {
      const selected = await openDialog({
        directory: false, multiple: false,
        filters: [{ name: "Epub Books", extensions: ["epub"] }],
        title: tagName ? `添加书籍到 ${tagName}` : "添加书籍",
      });
      if (typeof selected === "string") props.onAddEpub?.(selected, tagName);
    } catch (e) { console.error(e); }
  };

  const hasBottom = () => !!props.onOpenProfile || !!props.onOpenAbout;

  return (
    <>
      {/* 遮罩层（受父容器边界限制，需确保父容器具有 relative 定位） */}
      <div
        class={`absolute inset-0 bg-black/50 backdrop-blur-2xs z-40 transition-opacity duration-300 ${
          props.opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => { props.onClose?.(); setActiveMenuTag(null); }}
      />

      {/* 抽屉主体（改为 absolute，完全受外部父容器边界限制） */}
      <div
        ref={drawerRef}
        class={`absolute inset-y-0 left-0 z-50 w-full max-w-[240px] bg-zinc-900 text-zinc-100 shadow-xl flex flex-col p-3 overflow-hidden transform transition-transform duration-300 ${
          props.opened ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div class="px-1 pt-2 pb-1 font-semibold text-sm tracking-tight">我的书籍</div>
        <hr class="border-zinc-800 my-2" />

        {/* 分组/标签列表 */}
        <div class="flex-1 overflow-auto space-y-1">
          <For each={props.tags || []} fallback={<div class="text-xs text-zinc-500 text-center py-6 select-none">暂无分组，请先添加分组</div>}>
            {(tag) => {
              const isMenuOpen = () => activeMenuTag() === tag.name;

              return (
                <div class="relative flex items-center w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors group/tag">
                  <button
                    type="button"
                    onClick={() => {
                      props.onClose?.();
                      setActiveMenuTag(null);
                      setTimeout(() => props.onSelectTag?.(tag), 150);
                    }}
                    class="flex items-center gap-2.5 flex-1 text-left cursor-pointer bg-transparent border-none outline-none p-0 overflow-hidden select-none"
                  >
                    <IconFolder size={16} class="text-zinc-400 shrink-0" />
                    <span class="text-xs font-medium truncate text-zinc-200 group-hover/tag:text-white">{tag.name}</span>
                  </button>

                  <div class="relative tag-menu-container">
                    <button
                      type="button"
                      title="更多操作"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTag(isMenuOpen() ? null : tag.name);
                      }}
                      class="text-zinc-400 hover:text-zinc-100 p-1 bg-transparent border-none cursor-pointer outline-none transition-colors"
                    >
                      <IconDotsVertical size={14} />
                    </button>

                    <Show when={isMenuOpen()}>
                      <div class="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 p-1 flex flex-col gap-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTag(null);
                            handleAddEpub(tag.name);
                          }}
                          class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded transition-colors text-left cursor-pointer border-none bg-transparent outline-none"
                        >
                          <IconBook size={13} class="text-zinc-400" />
                          <span>添加书籍</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTag(null);
                            setConfirmDelTag(tag.name);
                          }}
                          class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded transition-colors text-left cursor-pointer border-none bg-transparent outline-none"
                        >
                          <IconTrash size={13} />
                          <span>删除分组</span>
                        </button>
                      </div>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>

        <hr class="border-zinc-800 my-2" />

        {/* 底部操作 */}
        <div class="space-y-1">
          <Btn icon={<IconFolderPlus size={16} class="text-zinc-400" />} label="添加分组" onClick={() => setTagInputOpen(true)} />
        </div>

        {/* 底部附加菜单 */}
        <Show when={hasBottom()}>
          <hr class="border-zinc-800 my-2" />
          <div class="space-y-0.5 shrink-0">
            <Show when={props.onOpenProfile}>
              <Btn icon={<IconUserCircle size={16} class="text-zinc-400" />} label="个人" onClick={() => { props.onClose?.(); setTimeout(() => props.onOpenProfile?.(), 150); }} />
            </Show>
            <Show when={props.onOpenAbout}>
              <Btn icon={<IconInfoCircle size={16} class="text-zinc-400" />} label="关于" onClick={() => { props.onClose?.(); setTimeout(() => props.onOpenAbout?.(), 150); }} />
            </Show>
          </div>
        </Show>
      </div>

      {/* 新建分组弹窗 */}
      <Modal open={tagInputOpen()} onClose={() => setTagInputOpen(false)} title="新建标签分组">
        <input
          type="text" placeholder="请输入分组名称..." value={tagNameInput()}
          onInput={(e) => setTagNameInput(e.currentTarget.value)}
          class="bg-zinc-800 text-zinc-100 text-xs px-3 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-zinc-500 w-full"
          autofocus
        />
        <div class="flex gap-2 pt-1">
          <ModalBtn label="取消" onClick={() => setTagInputOpen(false)} />
          <ModalBtn primary label="确定" onClick={() => { if (tagNameInput().trim()) { props.onAddTag?.(tagNameInput().trim()); setTagNameInput(""); setTagInputOpen(false); } }} />
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={!!confirmDelTag()} onClose={() => setConfirmDelTag(null)} title="确认删除">
        <p class="text-xs text-zinc-300 px-1">
          确定要删除分组 <span class="text-white font-semibold">“{confirmDelTag()}”</span> 吗？
        </p>
        <div class="flex gap-2 pt-2">
          <ModalBtn label="取消" onClick={() => setConfirmDelTag(null)} />
          <ModalBtn primary danger label="确认删除" onClick={() => { const name = confirmDelTag(); if (name) { props.onDelTag?.(name); setConfirmDelTag(null); } }} />
        </div>
      </Modal>
    </>
  );
}

// 内部轻量子组件
function Btn(p: { icon: any; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={p.onClick} class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-200 hover:text-white cursor-pointer bg-transparent border-none outline-none">
      {p.icon} <span class="text-xs font-medium">{p.label}</span>
    </button>
  );
}

function Modal(p: { open: boolean; onClose: () => void; title: string; children: any }) {
  return (
    <Dialog open={p.open} onOpenChange={(v) => !v && p.onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50" />
        <Dialog.Content class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[300px] bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 z-50 outline-none shadow-2xl">
          <div class="flex justify-between items-center px-1">
            <span class="font-semibold text-sm">{p.title}</span>
            <Dialog.Close class="bg-transparent border-none cursor-pointer text-zinc-400 hover:text-white p-1"><IconX size={18} /></Dialog.Close>
          </div>
          {p.children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function ModalBtn(p: { label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const cls = p.danger ? "bg-red-600 hover:bg-red-500 text-white" : p.primary ? "bg-zinc-100 hover:bg-white text-zinc-900" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700";
  return (
    <button type="button" onClick={p.onClick} class={`flex-1 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none outline-none ${cls}`}>
      {p.label}
    </button>
  );
}

export default BookDirectoryDrawer;