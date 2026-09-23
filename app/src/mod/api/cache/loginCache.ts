import { createHttpClient } from "@/api/createHttpClient";
import { createStorageCache } from "@/store/storageCache";
import { createAccountStorage } from "./hook/createAccountStorage";
import { tokenStore } from "@/store/tokenStore";


export interface LoginUserInfo {
  id: string;
  role: string;
  email: string;
  avatar_url: string | null;
  nickname: string | null;
  pushKey: string | null;
  updated_at: string;
}


interface UserInfo {
  id: string;
  role: string;
  email: string;
  avatar_url: string;
  nickname: string;
  timestamp: string;
}


interface LoginResponse {
  user: UserInfo;
  login_token: string;
  login_expired: string;
}

export const loginCache = {
  info: () => {
    return createStorageCache({
      cacheKey: ['login-info'],
      queryFn: async () => {
        const { http } = createHttpClient('/rpc/auth/login/');
        const { code, data, message } = await http.requestBodyJson<LoginUserInfo>('info', {});
        console.log('data', data)
        if (code !== 200) { throw new Error(message); }
        return data;
      },
    })
  },

  login: async (account: string, password: string) => {
    const { http } = createHttpClient('/rpc/auth/login/');
    if (!account || !password) throw new Error("请输入账号密码 ...");
    const { code, data, message } = await http.requestBodyJson<LoginResponse>("POST", { email: account, pass_word: password, });
    if (code !== 200) throw new Error(message);

    const { set: setUser } = createAccountStorage<UserInfo>();
    setUser({ account, user: { ...data.user, timestamp: new Date().toISOString() } });
    tokenStore.set(data.login_token, data.login_expired);
    return data;
  },

  register: async (account: string, password: string) => {
    const { http } = createHttpClient('/rpc/auth/register/');
    if (!account || !password) throw new Error("请输入账号密码 ...");
    const { code, data, message } = await http.requestBodyJson<string>("PUT", { email: account, pass_word: password, });
    if (code !== 200) throw new Error(message);
    return data;
  },
};


