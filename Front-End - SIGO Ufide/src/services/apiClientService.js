let onUnauthorizedHandler = null;
let unauthorizedShown = false;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedHandler = handler;
}

// En desarrollo puede apuntar directo al backend (ej: https://localhost:7287).
// En producción queda vacío y usa URLs relativas (proxy del servidor).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const isLoginRequest = url.includes("/api/Autenticacion/login");

  const response = await fetch(API_BASE + url, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && !isLoginRequest) {
    if (!unauthorizedShown) {
      unauthorizedShown = true;

      try {
        if (onUnauthorizedHandler) {
          await onUnauthorizedHandler();
        }
      } finally {
        setTimeout(() => {
          unauthorizedShown = false;
        }, 1000);
      }
    }
  }

  return response;
}