import { useNavigate } from "@tanstack/solid-router";
import { loginCache } from "@/api/cache/loginCache";
import UserProfileCard from "./ui/UserProfileCard";
import { useGlobalModal } from "@/hooks/useGlobalModal";
import { clearStorageCache } from "@/store/storageCache";
import { tokenStore } from "@/store/tokenStore";

export function AuthIndex() {
    const navigate = useNavigate();
    const { open } = useGlobalModal();
    const { data, loading } = loginCache.info().useQuery()

    console.log('data', data())

    return <UserProfileCard
        onLogout={() => {
            open({
                title: "登出",
                message: "退出当前账户？",
                onConfirm: async () => {
                    console.log("确认退出");
                    tokenStore.clear();
                    await clearStorageCache();
                    navigate({ to: '/auth/login', replace: true });
                },
                onCancel: () => {
                    
                }
            });
        }}
    />
}