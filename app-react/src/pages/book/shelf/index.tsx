import { BookShelf } from "./ui/BookShelf";
import { useStore2 } from "@/hooks/useStore2";
import { useLocalBooks } from "@/hooks/useLocalBooks";
import { useNavigate } from "@tanstack/react-router";
import { useAppBar } from "@/mod/store/useAppBar";
import { useEffect, useState } from "react";
import { ActionIcon, Box } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import BookDirectoryDrawer from "./ui/BookDirectoryDrawer";



export function Index() {
    const navigate = useNavigate()
    const height = useStore2(s => s.height)
    const { setTitle, setLeft, setRight } = useAppBar();
    const { folders, books, selectFolder, addFolder, delFolder } = useLocalBooks();
    const [bookDir, setBookDir] = useState(false)
    
    const handleOpen = async (name: string) => {
        try {
            navigate({ to: '/reader/$bookId', params: { bookId: name } })
        } catch (error) {
            console.error("打开 EPUB 失败:", error);
        }
    };

    useEffect(() => {
        setLeft(
            <ActionIcon variant="subtle" color="gray" onClick={() => { setBookDir(true) }}>
                <IconMenu2 size={20} />
            </ActionIcon>,
        );
        setTitle("书架");
        setRight(null);
    }, [setLeft, setRight, setTitle]);

    return (
        <Box>
            <BookDirectoryDrawer
                opened={bookDir}
                onClose={() => setBookDir(false)}
                folders={folders}
                onAddFolder={() => { console.log('添加文件夹'); addFolder() }}
                onSelectFolder={(f) => { console.log('选择文件夹：', f); selectFolder(f); }}
                onDeleteFolders={(ids) => { delFolder(ids) }}
            />

            <BookShelf height={height} books={books} onSelectBook={(book) => { console.log('book', book); handleOpen(book.path) }} />

        </Box>

    );
}