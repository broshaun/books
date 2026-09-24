import { createSignal, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useLocalBooks } from "@/hooks/useLocalBooks";
import { appBarStore } from "@/components/appBarStore";
import BookShelf from "./ui/BookShelf";
import BookDirectoryDrawer from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-solidjs";

export function Index() {
    const navigate = useNavigate();
    const height = () => useStore2.height;
    const { folders, books, selectFolder, addFolder, delFolder } = useLocalBooks();
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

    return (
        <div>
            <BookDirectoryDrawer
                opened={bookDir()}
                onClose={() => setBookDir(false)}
                folders={folders()}
                onAddFolder={() => {
                    console.log("添加文件夹");
                    addFolder();
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