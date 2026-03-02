import { useCallback, useMemo, useState } from "react";
import { usePasswordReset } from "@/pages/auth/hooks/usePasswordReset";

export function usePasswordResetFlow() {
  const api = usePasswordReset();

  const [step, setStep] = useState("request"); // request | verify | confirm | done
  const [correo, setCorreo] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const canRequest = useMemo(() => correo.trim().length >= 5, [correo]);
  const canVerify = useMemo(() => canRequest && otp.trim().length >= 4, [canRequest, otp]);
  const canConfirm = useMemo(() => resetToken.length > 10, [resetToken]);

  const start = useCallback(async () => {
    if (!canRequest) return false;
    const ok = await api.requestOtp(correo.trim());
    if (ok) setStep("verify");
    return ok;
  }, [api, correo, canRequest]);

  const verify = useCallback(async () => {
    if (!canVerify) return false;
    const token = await api.verifyOtp(correo.trim(), otp.trim());
    if (token) {
      setResetToken(token);
      setStep("confirm");
      return true;
    }
    return false;
  }, [api, correo, otp, canVerify]);

  const confirm = useCallback(async (newPassword) => {
    if (!canConfirm) return false;
    const ok = await api.confirmReset(resetToken, newPassword);
    if (ok) setStep("done");
    return ok;
  }, [api, resetToken, canConfirm]);

  const resetAll = useCallback(() => {
    setStep("request");
    setCorreo("");
    setOtp("");
    setResetToken("");
  }, []);

  return {
    step,
    correo,
    otp,
    resetToken,
    setCorreo,
    setOtp,
    start,
    verify,
    confirm,
    resetAll,
    loading: api.loading,
    error: api.error,
    clearError: api.clearError,
  };
}