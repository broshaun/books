import { apiConfig } from "@/config";
import { httpClient } from "@/lib/httpClient";
import { tokenStore } from "@/store/tokenStore";


export function isTauri() {
  return Boolean(
    (window as any).__TAURI_INTERNALS__
  );
}

export const createHttpClient = (path: string) => {
    // console.log('isTauri',isTauri())
    // const api = `${path}`

    const api = `${apiConfig.apiBase}${path}`
    const token = tokenStore.getState().get();
    return httpClient({ api, token })
}

