export const AUTH_LOGIN_PATH = "/aurelius/login";
export const AUTH_SIGNUP_PATH = "/signup";
export const AUTH_RESET_PASSWORD_PATH = "/reset-password";
export const AUTH_FALLBACK_LOGIN_PATH = "/login";
export const AUTH_FALLBACK_FORGOT_PASSWORD_PATH = "/forgot-password";
export const AUTH_DEFAULT_AFTER_LOGIN_PATH = "/portal/dashboard";

function sanitizeBase(raw: string): string {
  return String(raw || "").trim().replace(/\/+$/, "");
}

export function getAuthRedirectBase(): string {
  const configured = sanitizeBase(import.meta.env.VITE_AUTH_REDIRECT_BASE_URL || "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5173";
    }
    return sanitizeBase(window.location.origin);
  }

  return "http://localhost:5173";
}

export function toAuthAbsolute(path: string): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${getAuthRedirectBase()}${safePath}`;
}
