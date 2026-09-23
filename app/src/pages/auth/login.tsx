
import { useNavigate } from "@tanstack/solid-router";
import { apiConfig } from "@/config";
import { createMemo, createSignal } from "solid-js";
import { createAccountStorage } from "./hook/createAccountStorage";
import { useGlobalModal } from "@/hooks/useGlobalModal";
import LoginUI from "./ui/LoginUI";
import { loginCache } from "@/api/cache/loginCache";


interface UserInfo {
  id: string;
  role: string;
  email: string;
  avatar_url: string;
  nickname: string;
  timestamp: string;
}

interface LoginSubmitData {
  account: string;
  password: string;
}


export const Login = () => {



  const navigate = useNavigate();
  const { open } = useGlobalModal();
  const [account, setAccount] = createSignal('')
  const [loading, setLoading] = createSignal(false);

  const { get: getUser } = createAccountStorage<UserInfo>();
  const login = getUser(account());

  const src = createMemo(() => `${apiConfig.apiAvatar}/${login?.avatar_url || 'default.png'}`, [login]);


  console.log('src',src())

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
      avatarUrl={src()}
      onAccountChange={setAccount}
      onSubmit={handleSubmit}
    />
  );
};