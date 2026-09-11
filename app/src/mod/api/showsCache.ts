import { createHttpClient } from '@/lib/createHttpClient';
import { clearStorageCache, createStorageCache } from '@/mod/lib';


export interface FriendInfo {
    id: string;
    title: string;
    description: string;
    images?: string[];
    created_at: string;
    nickname: string;
    avatar_url: string;
}

export const showsCache2 = {
    getById: ({ id }: { id: string }) =>
        createStorageCache({
            primaryKey: (item) => item.id,
            cacheKey: ["getByIdShows", id],
            queryFn: async () => {
                const { http } = createHttpClient("/rpc/friend/show/");
                const { code, data, message } = await http.requestBodyJson<FriendInfo>("get", { id });
                if (code !== 200) throw new Error(message);
                return data;
            },
            staleTime: 12 * 3600 * 1000,
        }),
};