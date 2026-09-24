import { getDeviceInfo } from "tauri-plugin-device-info-api";
import { createHttpClient } from "@/api/createHttpClient";



interface Parameter {
    top: number;
    bottom: number;
}

interface SafelyInfo {
    id: string,
    manufacturer: string;
    model: string;
    top: number;
    bottom: number;
    created_at: string;
}

export const safetyCache = {
    set: async ({ top, bottom }: Parameter) => {
        const device = await getDeviceInfo()
        const { http } = createHttpClient('/rpc/public/safely/');
        const { code, message, data } = await http.requestBodyJson('set', { "manufacturer": device?.manufacturer, "model": device?.model, 'top': top, 'bottom': bottom })
        if (code !== 200) throw new Error(message);
        return data
    },
    get: async () => {
        const device = await getDeviceInfo()
        const { http } = createHttpClient('/rpc/public/safely/');
        const { code, message, data } = await http.requestBodyJson<SafelyInfo>('get', { "manufacturer": device?.manufacturer, "model": device?.model })
        console.log('code, message, data', code, message, data)
        if (code !== 200) throw new Error(message);
        return data
    },

}