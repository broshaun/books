import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { BookShelf } from "./ui/BookShelf";
import { useLocalBooks } from "./hooks/useLocalBooks";
import { BookDirectoryDrawer } from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-solidjs";
import { ScrollContainer } from "@/components/ScrollContainer";
import { useWindowTitle } from "@/hooks/useWindowTitle";


export function Shelf() {
    const navigate = useNavigate();
    const { folders, books, selectFolder, addFolder, delFolder } = useLocalBooks();
    const [left, setLeft] = createSignal(false);
    const { setTitle } = useWindowTitle();

    const handleOpen = async (name: string) => {
        try {
            setTitle(name)
            navigate({ to: "/desktop/reader/$bookId", params: { bookId: name } });
        } catch (error) {
            console.error("打开 EPUB 失败:", error);
        }
    };

    onMount(() => {
        setTitle('');
        appBarStore.set({
            left: (
                <button type="button" onClick={() => { setLeft(true) }}>
                    <IconMenu2 size={20} />
                </button>
            ),
            right: null
        });
    });


    return (
        <ScrollContainer>
            <BookDirectoryDrawer
                opened={left()}
                onClose={() => setLeft(false)}
                folders={folders()}
                onAddFolder={async (path) => {
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
                onOpenProfile={() => { navigate({ to: "/desktop/auth/" }) }}
            />

            <BookShelf
                height="100%"
                books={books()}
                onSelectBook={(book) => {
                    handleOpen(book.path);
                }}
            />
        </ScrollContainer>
    );
}

export default Shelf;