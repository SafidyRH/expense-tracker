const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3030";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }
  );

  if (!response.ok) {
    let message = "An error occurred";

    try {
      const body = await response.json();

      message =
        body?.error?.message ??
        body?.message ??
        message;
    } catch {
      // Ignore JSON parse error
    }

    throw new ApiError(
      response.status,
      message
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}