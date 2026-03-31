export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8081";

// HTTP version of WS_URL for health checks
export const WS_HTTP_URL = WS_URL.replace(/^ws(s?):/, "http$1:");
