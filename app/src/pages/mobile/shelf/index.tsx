import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { appBarStore } from "@/components/appBarStore";
import { BookShelf } from "./ui/BookShelf";
import { useLocalBooks } from "./hooks/useLocalBooks";
import { BookDirectoryDrawer } from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-solidjs";
import { ScrollContainer } from "@/components/ScrollContainer";

export function Shelf() {
    const navigate = useNavigate();
    const { folders, books, selectFolder, addFolder, updFolder, delFolder, addEpub, delEpub, updEpub } = useLocalBooks();


    const [left, setLeft] = createSignal(false);
    const handleOpen = async (name: string) => {
        try {
            navigate({ to: "/mobile/reader/$bookId", params: { bookId: name } });
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



    return (
        <ScrollContainer>
            <BookDirectoryDrawer
                opened={left()}
                onClose={() => setLeft(false)}
                folders={folders()}
                onAddEpub={async (filePath, name) => {
                    console.log('filePath,name', filePath, name)
                    await addEpub(filePath, name ?? undefined)
                }}
                onAddFolder={async (name) => {
                    console.log("选择标签组", name);
                    await addFolder(name);
                }}
                onDelFolder={async (name) => {
                    await delFolder(name);
                }}
                onUpdateFolder={async (id, folderName) => {
                    await updFolder(id, folderName);
                }}
                onSelectFolder={({ id, name }) => {
                    console.log("id", id);
                    console.log("name", name);
                    appBarStore.set({ title: name ?? undefined })
                    selectFolder(name ?? undefined);
                }}
                onOpenProfile={() => { navigate({ to: "/mobile/auth/" }) }}
            />


            <BookShelf
                height="100%"
                books={books()}
                onSelectBook={(book) => {
                    console.log("book", book);
                    handleOpen(book.path);
                }}
                onDelEpub={async (tagName) => {
                    delEpub(tagName)
                }}
                tags={folders()}
                onUpdEpub={async (bookName, tagName) => {
                    console.log('bookName,tagName', bookName, tagName)
                    await updEpub(bookName, tagName)
                }}
            />
        </ScrollContainer>
    );
}

export default Shelf;