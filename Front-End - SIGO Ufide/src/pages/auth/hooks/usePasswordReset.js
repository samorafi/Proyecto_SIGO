import { useCallback, useState } from "react";

function parseErrorMessage(text) {
  if (!text) return "";
  const s = text.trim();

  // Si parece JSON: {"message":"..."}
  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    try {
      const obj = JSON.parse(s);
      return obj?.message || obj?.mensaje || s;
    } catch {
      return s;
    }
  }

  return s;
}

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastStatus, setLastStatus] = useState(null); // <-- NUEVO

  const requestOtp = useCallback(async (correo) => {
    try {
      setLoading(true);
      setError("");
      setLastStatus(null);

      const res = await fetch("/api/autenticacion/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo }),
      });

      setLastStatus(res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = parseErrorMessage(text) || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Request siempre responde OK genérico
      return true;
    } catch (e) {
      setError(e?.message || "No se pudo solicitar el código");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (correo, otp) => {
    try {
      setLoading(true);
      setError("");
      setLastStatus(null);

      const res = await fetch("/api/autenticacion/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo, otp }),
      });

      setLastStatus(res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = parseErrorMessage(text) || "Código inválido o expirado";
        throw new Error(msg);
      }

      const data = await res.json();
      return data?.resetToken || "";
    } catch (e) {
      setError(e?.message || "Código inválido o expirado");
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmReset = useCallback(async (resetToken, newPassword) => {
    try {
      setLoading(true);
      setError("");
      setLastStatus(null);

      const res = await fetch("/api/autenticacion/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resetToken, newPassword }),
      });

      setLastStatus(res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = parseErrorMessage(text) || "No se pudo cambiar la contraseña";
        throw new Error(msg);
      }

      return true;
    } catch (e) {
      setError(e?.message || "No se pudo cambiar la contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
  setError("");
  setLastStatus(null);
}, []);


  return { loading, error, lastStatus, requestOtp, verifyOtp, confirmReset, clearError };
}