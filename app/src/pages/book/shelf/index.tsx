import { createSignal, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useStore2 } from "@/hooks/useStore2";
import { useLocalBooks } from "@/hooks/useLocalBooks";
import { useAppBar } from "@/hooks/useAppBar";
import BookShelf from "./ui/BookShelf";
import BookDirectoryDrawer from "./ui/BookDirectoryDrawer";
import { IconMenu2 } from "@tabler/icons-react";

export function Index() {
    const navigate = useNavigate();
    const height = () => useStore2.height;
    // const { setTitle, setLeft, setRight } = useAppBar();
    const { folders, books, selectFolder, addFolder, delFolder } = useLocalBooks();
    const [bookDir, setBookDir] = createSignal(false);

    const handleOpen = async (name: string) => {
        try {
            navigate({ to: "/book/$bookId", params: { bookId: name } });
        } catch (error) {
            console.error("打开 EPUB 失败:", error);
        }
    };

    onMount(() => {
        // setLeft(
        //   <button
        //     type="button"
        //     onClick={() => setBookDir(true)}
        //     class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer"
        //   >
        //     <IconMenu2 size={20} />
        //   </button>
        // );
        // setTitle("书架");
        // setRight(null);
    });

    // onCleanup(() => {
    //     setLeft(null);
    //     setTitle("");
    //     setRight(null);
    // });


    //   return <div>123</div>

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
                onSelectFolder={(f) => {
                    console.log("选择文件夹：", f);
                    selectFolder(f);
                }}
                onDeleteFolders={(ids) => {
                    delFolder(ids);
                }}
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