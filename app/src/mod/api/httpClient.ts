import { invoke } from "@tauri-apps/api/core";

export interface ApiResponse<T> {
  code: number | string;
  data: T;
  message: string;
}

export interface HttpClientOptions {
  api: string;
  token?: string | null;
}

type Payload = Record<string, unknown>;

export interface HttpClientInstance {
  endpoint(): string;
  http: {
    get<T = unknown>(): Promise<ApiResponse<T>>;
    getById<T = unknown>(id: string | number): Promise<ApiResponse<T>>;
    requestBodyJson<T = unknown>(methodName: string, payload?: Payload): Promise<ApiResponse<T>>;
    post<T = unknown>(methodName: string, payload?: Payload): Promise<ApiResponse<T>>;
    uploadFiles<T = unknown>(file: File): Promise<ApiResponse<T>>;
  };
}

export const isTauri = () => Boolean((window as any).__TAURI_INTERNALS__);

const replacer = (_: string, value: unknown): unknown =>
  value instanceof Map ? Object.fromEntries(value) :
  value instanceof Date ? value.toISOString() :
  value === undefined ? null : value;

const formatErrorMessage = (msg: unknown): string => {
  if (!msg) return "";
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) {
    return msg.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const loc = Array.isArray((item as any).loc)
          ? (item as any).loc.filter((p: unknown) => p !== "body").join(".")
          : "";
        const reason = (item as any).msg || (item as any).type || JSON.stringify(item);
        return loc ? `字段 [${loc}]: ${reason}` : String(reason);
      }
      return String(item);
    }).join(" | ");
  }
  try {
    return typeof msg === "object" ? JSON.stringify(msg) : String(msg);
  } catch {
    return String(msg);
  }
};

const parseResponse = <T>(response: unknown): ApiResponse<T> => {
  if (response == null || response === "") throw new Error("服务器未返回数据");

  let parsed = response;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    } catch {
      throw new Error("服务器返回的数据不是有效 JSON");
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed) || Object.keys(parsed).length === 0) {
    throw new Error("服务器未返回数据");
  }

  const res = parsed as Record<string, unknown>;
  if (!("code" in res) || !("data" in res)) {
    console.error("[HttpClient] 数据结构异常原始响应:", res);
    throw new Error("服务器返回的数据结构错误");
  }

  return {
    code: res.code as number | string,
    message: formatErrorMessage(res.message),
    data: res.data as T,
  };
};

export function httpClient({ api, token }: HttpClientOptions): HttpClientInstance {
  const endpointUrl = api.trim();
  if (!endpointUrl) throw new TypeError("[HttpClient] api cannot be empty.");

  const tauri = isTauri();
  const headers: Record<string, string> = token?.trim() ? { Authorization: token.trim() } : {};

  const request = async <T>(url: string, method: string, options?: { body?: any; headers?: Record<string, string> }): Promise<ApiResponse<T>> => {
    if (tauri) {
      const cmd = method === "GET" ? "http_get" : "http_post";
      const res = await invoke<unknown>(cmd, {
        options: {
          url,
          headers: { ...headers, ...(options?.headers || {}) },
          ...(options?.body ? { body: JSON.parse(JSON.stringify(options.body, replacer)) } : {}),
        },
      });
      return parseResponse<T>(res);
    }

    const res = await fetch(url, {
      method,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...headers,
        ...(options?.headers || {}),
      },
      body: options?.body ? JSON.stringify(options.body, replacer) : undefined,
    });
    return parseResponse<T>(await res.json());
  };

  const get = <T = unknown>(url = endpointUrl) => request<T>(url, "GET");
  const getById = <T = unknown>(id: string | number) => get<T>(`${endpointUrl}?id=${encodeURIComponent(id)}`);

  const requestBodyJson = <T = unknown>(methodName: string, payload: Payload = {}) =>
    request<T>(endpointUrl, "POST", {
      headers: { "X-HTTP-Method": methodName },
      body: payload,
    });

  const uploadFiles = async <T = unknown>(file: File): Promise<ApiResponse<T>> => {
    if (tauri) {
      const buffer = await file.arrayBuffer();
      const res = await invoke<unknown>("http_upload", {
        url: endpointUrl,
        fileBytes: Array.from(new Uint8Array(buffer)),
        fileName: file.name || "file",
      });
      return parseResponse<T>(res);
    }

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(endpointUrl, { method: "POST", headers, body: formData });
    return parseResponse<T>(await res.json());
  };

  return {
    endpoint: () => endpointUrl,
    http: {
      get: () => get(),
      getById,
      requestBodyJson,
      post: requestBodyJson,
      uploadFiles,
    },
  };
}