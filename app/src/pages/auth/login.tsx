
import { useNavigate } from "@tanstack/solid-router";
import { apiConfig } from "@/config";
// import { useCachedImage } from "@hooks/useCachedImage";
import { useMemo } from "react";
import { useLocalStorageState, useRequest } from "ahooks";
import { useAccountStorage } from "./hook/useAccountStorage";
import { createHttpClient } from "@/lib/createHttpClient";
import { useGlobalModal } from "@/store/useGlobalModal";
import { tokenStore } from "@/store/tokenStore";
import LoginUI from "./ui/LoginUI";



interface UserInfo {
  id: string;
  role: string;
  email: string;
  avatar_url: string;
  nickname: string;
  timestamp: string;
}

interface LoginUserResponse {
  id: string;
  role: string;
  email: string;
  avatar_url: string;
  nickname: string;
}

interface LoginResponse {
  user: LoginUserResponse;
  login_token: string;
  login_expired: string;
}

interface LoginSubmitData {
  account: string;
  password: string;
}


export const Login = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useLocalStorageState<string>("current_account", { defaultValue: "" });
  const { set: setUser, get: getUser } = useAccountStorage<UserInfo>();
  const login = getUser(account);


  const { http } = createHttpClient('/rpc/friend/login/');
  async function onLogin(account: string, password: string): Promise<LoginResponse> {
    if (!account || !password) throw new Error("请输入账号密码 ...");
    const { code, data, message } = await http.requestBodyJson<LoginResponse>("POST", { email: account, pass_word: password, });
    if (code !== 200) throw new Error(message);
    return data;
  }

  const { loading, runAsync } = useRequest(onLogin, {
    manual: true,
    onSuccess: async (data) => {
      setUser({ account, user: { ...data.user, timestamp: new Date().toISOString() } });
      tokenStore.set(data.login_token, data.login_expired);


      console.log('tokenStore++')

      navigate({ 'to': '/web/friend/shows' });
    },
    onError: () => {
      useGlobalModal.getState().open({
        title: "登录提示",
        message: "账号或密码错误",
      });
    },
  });

  const src = useMemo(() => `${apiConfig.apiAvatar}/${login?.avatar_url || 'default.png'}`, [login]);
  const handleAccountChange = (value: string,): void => {
    setAccount(value);
  };

  const handleSubmit = async ({ account, password }: LoginSubmitData): Promise<void> => {
    await runAsync(account, password);
  };

  return (
    <LoginUI
      loading={loading}
      avatarUrl={src}
      defaultAccount={account}
      onAccountChange={handleAccountChange}
      onSubmit={handleSubmit}
    />
  );
};