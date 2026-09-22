import { createHttpClient } from "@/api/createHttpClient";
import { createStorageCache } from "@/store/storageCache";


export interface LoginUserInfo {
  id: string;
  role: string;
  email: string;
  avatar_url: string | null;
  nickname: string | null;
  pushKey: string | null;
  updated_at: string;
}



export const loginCache = {
  info: createStorageCache({
    cacheKey: ['login-info'],
    queryFn: async () => {
      const { http } = createHttpClient('/rpc/auth/login/');
      const { code, data, message } = await http.requestBodyJson<LoginUserInfo>('info', {});
      console.log('data',data)
      if (code !== 200) { throw new Error(message); }
      return data;
    },
  }),
};