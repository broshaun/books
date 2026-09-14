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

const formatErrorMessage = (msg: unknown): string => {
  if (!msg) return "";
  if (typeof msg === "string") return msg;

  if (Array.isArray(msg)) {
    return msg
      .map((item: any) => {
        if (typeof item === "string") return item;

        const loc = Array.isArray(item?.loc)
          ? item.loc.filter((p: unknown) => p !== "body").join(".")
          : "";

        const reason = item?.msg ?? item?.type ?? JSON.stringify(item);
        return loc ? `字段 [${loc}]: ${reason}` : reason;
      })
      .join(" | ");
  }

  return typeof msg === "object" ? JSON.stringify(msg) : String(msg);
};

const parseResponse = <T>(res: unknown): ApiResponse<T> => {
  if (!res || typeof res !== "object" || Array.isArray(res) || !("code" in res) || !("data" in res)) {
    console.error("[HttpClient] 数据结构异常:", res);
    throw new Error("服务器返回的数据结构错误");
  }

  const r = res as Record<string, unknown>;
  return {
    code: r.code as number | string,
    data: r.data as T,
    message: formatErrorMessage(r.message),
  };
};

export function httpClient({ api, token }: HttpClientOptions) {
  const endpointUrl = api.trim();
  if (!endpointUrl) throw new TypeError("[HttpClient] api cannot be empty.");

  const headers = token?.trim() ? { Authorization: token.trim() } : {};
  const request = (cmd: string, args: Record<string, unknown>) => invoke<unknown>(cmd, args).then(parseResponse);

  const get = <T = unknown>() =>
    request("http_get", { options: { url: endpointUrl, headers } }) as Promise<ApiResponse<T>>;

  const getById = <T = unknown>(id: string | number) =>
    request("http_get", {
      options: { url: `${endpointUrl}?id=${encodeURIComponent(id)}`, headers },
    }) as Promise<ApiResponse<T>>;

  const requestBodyJson = <T = unknown>(methodName: string, payload: Payload = {}) =>
    request("http_post", {
      options: {
        url: endpointUrl,
        headers: { ...headers, "X-HTTP-Method": methodName },
        body: payload,
      },
    }) as Promise<ApiResponse<T>>;

  const uploadFiles = async <T = unknown>(file: File) => {
    const fileBytes = Array.from(new Uint8Array(await file.arrayBuffer()));
    return request("http_upload", {
      url: endpointUrl,
      fileBytes,
      fileName: file.name || "file",
      headers,
    }) as Promise<ApiResponse<T>>;
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