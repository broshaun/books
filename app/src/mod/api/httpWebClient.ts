export interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}

export interface HttpClientOptions {
    api: string;
    token?: string | null;
}

type Payload = Record<string, unknown>;

export interface HttpClientInstance {
    endpoint: () => string;
    http: {
        get: <T = unknown>() => Promise<ApiResponse<T>>;
        getById: <T = unknown>(id: string | number) => Promise<ApiResponse<T>>;
        requestBodyJson: <T = unknown>(methodName: string, payload?: Payload) => Promise<ApiResponse<T>>;
        post: <T = unknown>(methodName: string, payload?: Payload) => Promise<ApiResponse<T>>;
        uploadFiles: <T = unknown>(file: File) => Promise<ApiResponse<T>>;
    };
}

const replacer = (_: string, value: unknown): unknown => {
    if (value instanceof Map) return Object.fromEntries(value);
    if (value instanceof Date) return value.toISOString();
    return value === undefined ? null : value;
};

const parseResponse = <T>(response: unknown): ApiResponse<T> => {
    if (response === null || response === undefined || response === "") {
        throw new Error("服务器未返回数据");
    }

    let parsed = response;
    if (typeof response === "string") {
        try {
            parsed = JSON.parse(response);
        } catch {
            throw new Error("服务器返回的数据不是有效 JSON");
        }
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("服务器返回的数据格式错误");
    }

    const res = parsed as Record<string, unknown>;
    if (typeof res.code !== "number" || typeof res.message !== "string" || !("data" in res)) {
        throw new Error("服务器返回的数据结构错误");
    }

    return res as unknown as ApiResponse<T>;
};

export function httpClient({ api, token }: HttpClientOptions): HttpClientInstance {
    const endpointUrl = api.trim();
    if (!endpointUrl) throw new TypeError("[HttpClient] api cannot be empty.");

    const headers: HeadersInit = token?.trim() ? { Authorization: token.trim() } : {};

    const request = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
        const res = await fetch(url, {
            ...options,
            headers: { ...headers, ...options?.headers },
        });
        return parseResponse<T>(await res.json());
    };

    const get = <T = unknown>() => request<T>(endpointUrl, { method: "GET" });

    const getById = <T = unknown>(id: string | number) =>
        request<T>(`${endpointUrl}?id=${encodeURIComponent(id)}`, { method: "GET" });

    const requestBodyJson = <T = unknown>(methodName: string, payload: Payload = {}) =>
        request<T>(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-HTTP-Method": methodName },
            body: JSON.stringify(payload, replacer),
        });

    const uploadFiles = <T = unknown>(file: File) => {
        const formData = new FormData();
        formData.append("file", file, file.name || "file");
        return request<T>(endpointUrl, { method: "POST", body: formData });
    };

    return {
        endpoint: () => endpointUrl,
        http: {
            get,
            getById,
            requestBodyJson,
            post: requestBodyJson,
            uploadFiles,
        },
    };
}