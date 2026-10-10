import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { appBarStore } from "@/components/appBarStore";
import BookShelf from "./ui/BookShelf";
import { useLocalBooks } from "./hooks/useLocalBooks";
import BookDirectoryDrawer from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-solidjs";


export function Shelf() {
    const navigate = useNavigate();
    const height = () => useStore2.height;
    const { folders, books, selectFolder, addFolder, delFolder } = useLocalBooks();
    const [left, setLeft] = createSignal(false);

    const handleOpen = async (name: string) => {
        try {
            navigate({ to: "/desktop/reader/$bookId", params: { bookId: name } });
        } catch (error) {
            console.error("打开 EPUB 失败:", error);
        }
    };

    onMount(() => {
        appBarStore.set({
            left: (
                <button type="button" onClick={() => { setLeft(true) }}>
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
                opened={left()}
                onClose={() => setLeft(false)}
                folders={folders()}
                onAddFolder={async (path) => {
                    console.log("设置文件夹", path);
                    await addFolder(path);

                }}
                onDelFolder={async (path) => {
                    await delFolder(path);
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

export default Shelf;