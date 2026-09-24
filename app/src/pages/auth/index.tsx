import { useNavigate } from "@tanstack/solid-router";
import { loginCache } from "@/api/cache/loginCache";
import UsrInfoUI from "./ui/UsrInfoUI";
import { useGlobalModal } from "@/hooks/useGlobalModal";
import { clearStorageCache } from "@/store/storageCache";
import { tokenStore } from "@/store/tokenStore";
import { createEffect } from "solid-js";
import { useStore2 } from "@/hooks/useStore2";
import { useEpubNotesSync } from "../book/reader/hook/useEpubNotesSync";
import { notesCache } from "@/api/cache/notesCache";


export function AuthIndex() {
    const navigate = useNavigate();
    const { open } = useGlobalModal();
    const { data, loading } = loginCache.info().useQuery()
    const height = () => useStore2.height;
    const token = tokenStore.get();



    createEffect(() => {
        if (!token) {
            navigate({ to: "/auth/login" });
        }
    })


    const { isSyncing, syncNow } = useEpubNotesSync({
        onSyncGet: async () => {
            let note = await notesCache.get()
            console.log('note', note)
            return note
        }
    });

    return <div>
        <UsrInfoUI
            height={height()}
            data={data()}
            onLogout={() => {
                open({
                    title: "登出",
                    message: "退出当前账户？",
                    onConfirm: async () => {
                        console.log("确认退出");
                        tokenStore.clear();
                        await clearStorageCache();
                        navigate({ to: '/auth/login' });
                    },
                    onCancel: () => { }
                });
            }}
            isSyncing={isSyncing()}
            onDownloadNotes={async() => {await syncNow() }}
        />
    </div>
}