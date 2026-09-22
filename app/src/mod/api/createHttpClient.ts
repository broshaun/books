import { apiConfig } from "@/config";
import { httpClient  } from "./httpClient";
import { tokenStore } from "@/store/tokenStore";


export const createHttpClient = (path: string) => {
    const api = `${apiConfig.apiBase}${path}`
    const token = tokenStore.get();

    console.log('api',api)
    console.log('token',token)

    return httpClient({ api, token })
}

