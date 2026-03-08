let onUnauthorizedHandler = null;
let unauthorizedShown = false;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedHandler = handler;
}

export async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const isLoginRequest = url.includes("/api/Autenticacion/login");

  const response = await fetch(url, {
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