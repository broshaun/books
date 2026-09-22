import { useRequest } from "ahooks";
import { createHttpClient } from "@/lib/createHttpClient";
import { useGlobalModal } from "@/store/useGlobalModal";
import RegisterUI from "./ui/RegisterUI";
import { LoadingOverlay } from "@mantine/core";



export function Register() {
    const { http } = createHttpClient('/rpc/friend/register/');
    const { loading, runAsync } = useRequest(
        async ({ account, password }) => {
            if (!account || !password) {
                throw new Error("请输入账号密码...");
            }
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(account)) {
                throw new Error("手机号格式不正确");
            }
            if (password.length < 6) {
                throw new Error("密码至少6位");
            }
            const { code, data, message } = await http.requestBodyJson<string>("PUT", {
                email: account,
                pass_word: password,
            });
            if (code !== 200) throw new Error(message || "注册失败");
            console.log('data++', data)
            return data;
        },
        {
            manual: true,
            onSuccess: async () => {
                useGlobalModal.getState().open({
                    title: "注册提示",
                    message: "账号注册成功！",
                });
            },
            onError: async (error) => {
                useGlobalModal.getState().open({
                    title: "注册提示",
                    message: error.message || "注册失败",
                });
            },
        });

    if (loading) {
        return <LoadingOverlay visible />;
    }

    return (
        <RegisterUI
            loading={loading}
            onSubmit={async ({ account, password }) => {
                await runAsync({ account, password });
            }}
        />
    );
}

