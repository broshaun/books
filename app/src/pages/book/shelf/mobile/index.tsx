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
    const { tags, books, selectTag, addTag, delTag, addEpub, delEpub, updEpub } = useLocalBooks();
    const [left, setLeft] = createSignal(false);

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
                tags={tags()}
                onAddEpub={async (filePath, name) => {
                    console.log('filePath,name', filePath, name)
                    await addEpub(filePath, name ?? undefined)
                }}
                onAddTag={async (name) => {
                    console.log("选择标签组", name);
                    await addTag(name);

                }}
                onDelTag={async (name) => {
                    await delTag(name);
                }}
                onSelectTag={({ id, name }) => {
                    console.log("id", id);
                    console.log("name", name);
                    appBarStore.set({ title: name ?? undefined })
                    selectTag(name ?? undefined);
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
                onDelEpub={async (tagName) => {
                    delEpub(tagName)
                }}
                tags={tags()}
                onUpdEpub={async (bookName, tagName) => {
                    console.log('bookName,tagName', bookName, tagName)
                    await updEpub(bookName, tagName)
                 
                }}
            />
        </div>
    );
}

export default Shelf;