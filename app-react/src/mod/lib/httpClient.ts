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

interface HttpMethods {
  get<T = unknown>(): Promise<ApiResponse<T>>;
  getById<T = unknown>(id: string | number): Promise<ApiResponse<T>>;
  requestBodyJson<T = unknown>(methodName: string, payload?: Payload): Promise<ApiResponse<T>>;
  post<T = unknown>(methodName: string, payload?: Payload): Promise<ApiResponse<T>>;
  uploadFiles<T = unknown>(file: File): Promise<ApiResponse<T>>;
}

export interface HttpClientInstance {
  endpoint(): string;
  http: HttpMethods;
}

export function isTauri() {
  return Boolean((window as any).__TAURI_INTERNALS__);
}

function replacer(_: string, value: unknown): unknown {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  return value === undefined ? null : value;
}

/**
 * 专门格式化后端返回的各种 message 格式
 * 兼容 Pydantic 校验错误数组 (e.errors())，防止前端出现 [object Object]
 */
function formatErrorMessage(msg: unknown): string {
  if (!msg) return "";
  if (typeof msg === "string") return msg;

  // 1. 处理 Pydantic 校验错误数组的情况
  if (Array.isArray(msg)) {
    return msg
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          // 提取字段位置 (如: exam_id)
          const loc = Array.isArray((item as any).loc)
            ? (item as any).loc.filter((part: unknown) => part !== "body").join(".")
            : "";
          const reason = (item as any).msg || (item as any).type || JSON.stringify(item);
          return loc ? `字段 [${loc}]: ${reason}` : String(reason);
        }
        return String(item);
      })
      .join(" | ");
  }

  // 2. 处理普通对象的情况，避免转为 [object Object]
  if (typeof msg === "object") {
    try {
      return JSON.stringify(msg);
    } catch {
      return String(msg);
    }
  }

  return String(msg);
}

function parseResponse<T>(response: unknown): ApiResponse<T> {
  // 1. 拦截空值、空字符串
  if (response === null || response === undefined || response === "") {
    throw new Error("服务器未返回数据");
  }

  let parsed = response;

  // 2. 如果是字符串，尝试解析 JSON（兼容双重序列化场景）
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch {
      throw new Error("服务器返回的数据不是有效 JSON");
    }
  }

  // 3. 校验解析结果是否为合法对象（拦截 null、数组及基础数据类型）
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("服务器未返回数据");
  }

  const result = parsed as Record<string, unknown>;

  // 4. 再次判断对象内容，若解包结果为空对象或 null 侧抛出提示
  if (Object.keys(result).length === 0) {
    throw new Error("服务器未返回数据");
  }

  // 5. 校验必要的响应字段结构
  const hasCode = typeof result.code === "number" || typeof result.code === "string";
  const hasData = "data" in result;

  if (!hasCode || !hasData) {
    console.error("[HttpClient] 数据结构异常原始响应:", result);
    throw new Error("服务器返回的数据结构错误");
  }

  // 6. 安全规范化输出 (使用 formatErrorMessage 彻底清洗 message)
  return {
    code: result.code as number | string,
    message: formatErrorMessage(result.message),
    data: result.data as T,
  };
}

export function httpClient({ api, token }: HttpClientOptions): HttpClientInstance {
  const endpointUrl = api.trim();

  if (!endpointUrl) {
    throw new TypeError("[HttpClient] api cannot be empty.");
  }

  const tauri = isTauri();

  const headers: Record<string, string> = token?.trim()
    ? { Authorization: token.trim() }
    : {};

  const request = async <T>(methodName: string, payload: Payload = {}): Promise<ApiResponse<T>> => {
    if (tauri) {
      const response = await invoke<unknown>("http_post", {
        options: {
          url: endpointUrl,
          headers: {
            ...headers,
            "X-HTTP-Method": methodName,
          },
          body: JSON.parse(JSON.stringify(payload, replacer)),
        },
      });

      return parseResponse<T>(response);
    }

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
        "X-HTTP-Method": methodName,
      },
      body: JSON.stringify(payload, replacer),
    });

    return parseResponse<T>(await response.json());
  };

  const get = async <T>(): Promise<ApiResponse<T>> => {
    if (tauri) {
      return parseResponse<T>(
        await invoke("http_get", {
          options: {
            url: endpointUrl,
            headers,
          },
        }),
      );
    }

    const response = await fetch(endpointUrl, {
      method: "GET",
      headers,
    });

    return parseResponse<T>(await response.json());
  };

  const getById = async <T>(id: string | number): Promise<ApiResponse<T>> => {
    const url = `${endpointUrl}?id=${encodeURIComponent(String(id))}`;

    if (tauri) {
      return parseResponse<T>(
        await invoke("http_get", {
          options: {
            url,
            headers,
          },
        }),
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    return parseResponse<T>(await response.json());
  };

  const uploadFiles = async <T>(file: File): Promise<ApiResponse<T>> => {
    if (tauri) {
      const buffer = await file.arrayBuffer();

      return parseResponse<T>(
        await invoke("http_upload", {
          url: endpointUrl,
          fileBytes: Array.from(new Uint8Array(buffer)),
          fileName: file.name || "file",
        }),
      );
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    return parseResponse<T>(await response.json());
  };

  return {
    endpoint: () => endpointUrl,
    http: {
      get,
      getById,
      requestBodyJson: request,
      post: request,
      uploadFiles,
    },
  };
}