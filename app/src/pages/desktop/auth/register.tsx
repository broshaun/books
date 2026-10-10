import { createSignal } from "solid-js";
import { useGlobalModal } from "@/hooks/useGlobalModal";
import { useNavigate } from "@tanstack/solid-router";
import RegisterUI from "./ui/RegisterUI";
import { loginCache } from "@/api/cache/loginCache";




export function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = createSignal(false);
    const { open } = useGlobalModal();

    interface LoginSubmitData {
        account: string;
        password: string;
    }
    const handleSubmit = async ({ account, password }: LoginSubmitData): Promise<void> => {
        if (loading()) return;
        setLoading(true);
        try {
            await loginCache.register(account, password);
            navigate({ 'to': '/auth/login' });
            open({
                title: "注册提示",
                message: "账号注册成功！",
            });
        } catch (err: any) {
            console.log('err', err)
            open({
                title: "注册提示",
                message: err?.message || "注册失败，请稍后重试"
            });
        } finally {
            setLoading(false);
        }

    };

    return (
        <RegisterUI
            loading={loading()}
            onSubmit={handleSubmit}
            toLogin={() => { navigate({ 'to': '/auth/login' }) }}
        />
    );
}

