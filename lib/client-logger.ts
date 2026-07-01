export function logClientError(message: string, err?: unknown) {
  console.error(message, err)
  try {
    fetch("/api/log/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack: err instanceof Error ? err.stack : undefined,
        url: globalThis.location?.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  } catch {
    // silently fail
  }
}
