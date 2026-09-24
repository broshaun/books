import { useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { useGlobalModal } from "@/hooks/useGlobalModal";
import { loginCache } from "@/api/cache/loginCache";
import LoginUI from "./ui/LoginUI";



interface LoginSubmitData {
  account: string;
  password: string;
}


export const Login = () => {
  const navigate = useNavigate();
  const { open } = useGlobalModal();
  const [loading, setLoading] = createSignal(false);


  const handleSubmit = async ({ account, password }: LoginSubmitData): Promise<void> => {
    if (loading()) return;
    setLoading(true);
    try {
      await loginCache.login(account, password);
      navigate({ 'to': '/book/shelf' });
    } catch {
      open({
        title: "登录提示",
        message: "账号或密码错误",
      });
    } finally {
      setLoading(false);
    }

  };

  return (
    <LoginUI
      loading={loading()}
      onSubmit={handleSubmit}
      toRegister={() => { navigate({ 'to': '/auth/register' }) }}
    />
  );
};