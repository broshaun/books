import { createHttpClient } from "@/api/createHttpClient";


export interface Note {
    id?:string;
    bookId: string;
    bookName: string;
    index: number;
    cfiRange: string;
    text: string;
    title?: string;
    color?: string;
    isUnderline?: boolean;
    tags?: string[];
    content?: string;
    created_at?: string;
    updatedAt?: number;
}


export const notesCache = {
    get: async () => {
        const payload: Record<string, any> = {};
        const { http } = createHttpClient('/rpc/books/notes/');
        const { code, data, message } = await http.requestBodyJson<Note[]>("get", payload);
        console.log('data+++',data)
        if (code !== 200) throw new Error(message);
        return data;
    },

    set: async (notes: Note[]) => {
        
        const payload: Record<string, any> = {};
        payload['notes'] = notes;
        const { http } = createHttpClient('/rpc/books/notes/');
        const { code, data, message } = await http.requestBodyJson<Note[]>("set", payload);
        if (code !== 200) throw new Error(message);
        return data;
    }
}
