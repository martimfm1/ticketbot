export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    throw new Error("INVALID_REQUEST_ORIGIN");
  }

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new Error("INVALID_REQUEST_ORIGIN");
  }

  if (originUrl.host !== host) {
    throw new Error("INVALID_REQUEST_ORIGIN");
  }
}
