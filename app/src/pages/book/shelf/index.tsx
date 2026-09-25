import { createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useLocalBooks } from "@/hooks/useLocalBooks";
import { appBarStore } from "@/components/appBarStore";
import BookShelf from "./ui/BookShelf";
import BookDirectoryDrawer2 from "./ui/BookDirectoryDrawer2";
import BookDirectoryDrawer from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-solidjs";

export function Index() {
    const navigate = useNavigate();
    const height = () => useStore2.height;
    const { folders, books, selectFolder, addFolder, delFolder, clearFolder } = useLocalBooks();
    const [bookDir, setBookDir] = createSignal(false);

    const handleOpen = async (name: string) => {
        try {
            navigate({ to: "/reader/$bookId", params: { bookId: name } });
        } catch (error) {
            console.error("打开 EPUB 失败:", error);
        }
    };

    onMount(() => {
        appBarStore.set({
            left: (
                <button type="button" onClick={() => { setBookDir(true) }}>
                    <IconMenu2 size={20} />
                </button>
            ),
            right: null
        });
    });



    console.log('height', height())


    const isAndroid = /Android/i.test(navigator.userAgent);
    const ua = navigator.userAgent;

    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isPc = !isAndroid && !isIos;

    console.log("当前是否为安卓环境：", isAndroid);

    return (
        <div>

            <Show when={isPc}>


                <BookDirectoryDrawer
                    opened={bookDir()}
                    onClose={() => setBookDir(false)}
                    folders={folders()}
                    onAddFolder={async (file_path) => {
                        console.log("添加文件夹", file_path);
                        await addFolder(file_path);
                    }}
                    onSelectFolder={({ id, name, path }) => {
                        console.log("id", id);
                        console.log("name", name);
                        console.log("path", path);
                        appBarStore.set({ title: name })

                        selectFolder(path);
                    }}
                    onDeleteFolders={(ids) => {
                        delFolder(ids);
                    }}
                    onOpenProfile={() => { navigate({ to: "/auth/" }) }}
                />

            </Show>

            <Show when={isAndroid}>
                <BookDirectoryDrawer2
                    opened={bookDir()}
                    onClose={() => setBookDir(false)}
                    folders={folders()}
                    onUpdateFolders={async (sub_folders) => {
                        console.log("更新的子文件夹列表：", sub_folders);
                        await clearFolder();
                        for (const folder of sub_folders) {
                            await addFolder(folder.path);
                        }
                    }}
                    onSelectFolder={({ id, name, path }) => {
                        console.log("id", id);
                        console.log("name", name);
                        console.log("path", path);
                        appBarStore.set({ title: name })

                        selectFolder(path);
                    }}
                    onOpenProfile={() => { navigate({ to: "/auth/" }) }}
                />
            </Show>

            <BookShelf
                height={height()}
                books={books()}
                onSelectBook={(book) => {
                    console.log("book", book);
                    handleOpen(book.path);
                }}
            />
        </div>
    );
}

export default Index;