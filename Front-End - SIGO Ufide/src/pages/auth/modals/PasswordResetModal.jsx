import { useEffect, useMemo, useRef, useState } from "react";
import AppModal from "@/components/ui/Modals/AppModal";
import { Input, Button, Typography } from "@material-tailwind/react";
import { usePasswordResetFlow } from "@/pages/auth/hooks/usePasswordResetFlow";
import { useAlert } from "@/hooks/useAlert";

const OTP_LEN = 6;
const OTP_TTL_SEC = 4 * 60;     // 4 minutos de vida de OTP
const RESEND_GRACE_SEC = 60;    // 1 minuto extra para reenviar

function Banner({ type = "warning", title = "Aviso", message }) {
    if (!message) return null;

    const styles = {
        warning: {
            border: "border-amber-500",
            bg: "bg-amber-50",
            textTitle: "text-amber-900",
            textMsg: "text-amber-800",
            icon: "text-amber-600",
        },
        error: {
            border: "border-red-500",
            bg: "bg-red-50",
            textTitle: "text-red-900",
            textMsg: "text-red-800",
            icon: "text-red-600",
        },
        info: {
            border: "border-blue-500",
            bg: "bg-blue-50",
            textTitle: "text-blue-900",
            textMsg: "text-blue-800",
            icon: "text-blue-600",
        },
    };

    const s = styles[type] || styles.warning;

    return (
        <div className="mb-2">
            <div className={`flex gap-3 rounded-lg border-l-4 ${s.border} ${s.bg} p-4 shadow-sm`}>
                <div className="shrink-0">
                    <svg className={`h-5 w-5 ${s.icon}`} viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>

                <div>
                    <Typography variant="small" className={`font-bold ${s.textTitle}`}>
                        {title}
                    </Typography>
                    <Typography variant="small" className={`leading-relaxed ${s.textMsg}`}>
                        {message}
                    </Typography>
                </div>
            </div>
        </div>
    );
}

function OtpBoxes({ length = OTP_LEN, value, onChange, disabled }) {
    const [digits, setDigits] = useState(Array(length).fill(""));
    const refs = useRef([]);

    useEffect(() => {
        const arr = Array(length).fill("");
        const clean = (value || "").replace(/\D/g, "").slice(0, length);
        clean.split("").forEach((ch, i) => (arr[i] = ch));
        setDigits(arr);
    }, [value, length]);

    const composed = useMemo(() => digits.join(""), [digits]);

    useEffect(() => {
        const clean = composed.replace(/\D/g, "").slice(0, length);
        if (clean !== (value || "")) onChange?.(clean);
    }, [composed]);

    function setAt(i, raw) {
        const only = (raw || "").replace(/\D/g, "");

        // pegar todo el OTP
        if (only.length > 1) {
            const next = Array(length).fill("");
            only
                .slice(0, length)
                .split("")
                .forEach((ch, idx) => (next[idx] = ch));
            setDigits(next);
            const last = Math.min(only.length, length) - 1;
            setTimeout(() => refs.current?.[last]?.focus(), 0);
            return;
        }

        const next = [...digits];
        next[i] = only.slice(-1);
        setDigits(next);

        if (only && i < length - 1) refs.current?.[i + 1]?.focus();
    }

    function onKeyDown(i, e) {
        if (e.key === "Backspace") {
            if (digits[i]) {
                const next = [...digits];
                next[i] = "";
                setDigits(next);
                return;
            }
            if (i > 0) refs.current?.[i - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && i > 0) refs.current?.[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < length - 1) refs.current?.[i + 1]?.focus();
    }

    return (
        <div className="flex justify-between gap-2">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    value={d}
                    disabled={disabled}
                    onChange={(e) => setAt(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="h-12 w-12 rounded-xl border border-blue-gray-200 bg-white text-center text-lg font-semibold text-blue-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
            ))}
        </div>
    );
}

export default function PasswordResetModal({ open, onClose, initialEmail = "" }) {
    const alert = useAlert();

    const {
        step,
        correo,
        otp,
        setCorreo,
        setOtp,
        start,
        verify,
        confirm,
        resetAll,
        loading,
        error,
        clearError
    } = usePasswordResetFlow();

    useEffect(() => {
        if (open) {
            setCorreo(initialEmail || "");
        } else {
            resetAll();
        }
    }, [open, initialEmail, setCorreo, resetAll]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");

    const tooShort = newPassword.length > 0 && newPassword.length < 8;
    const mismatch =
        newPassword.length > 0 && confirmPwd.length > 0 && newPassword !== confirmPwd;

    const handleConfirm = async () => {
        if (tooShort || mismatch) return;
        await confirm(newPassword);
    };

    const handleClose = () => {
        clearError?.();
        resetAll();
        setNewPassword("");
        setConfirmPwd("");

        // resetea timer/fase OTP si estás usando las 2 fases
        setOtpPhase("active");
        setOtpSecondsLeft(OTP_TTL_SEC);

        onClose?.();
    };

    const [otpPhase, setOtpPhase] = useState("active"); // "active" | "grace"
    const [otpSecondsLeft, setOtpSecondsLeft] = useState(OTP_TTL_SEC);

    // reinicia timer al entrar a verify
    useEffect(() => {
        if (!open) return;
        if (step === "verify") {
            setOtpPhase("active");
            setOtpSecondsLeft(OTP_TTL_SEC);
        }
    }, [step, open]);

    // countdown (sirve para ambas fases)
    useEffect(() => {
        if (!open) return;
        if (step !== "verify") return;
        if (otpSecondsLeft <= 0) return;

        const t = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [open, step, otpSecondsLeft]);

    // transiciones de fase
    useEffect(() => {
        if (!open) return;
        if (step !== "verify") return;

        if (otpSecondsLeft <= 0) {
            if (otpPhase === "active") {
                // se acabó el OTP -> ventana de gracia para reenviar
                setOtpPhase("grace");
                setOtpSecondsLeft(RESEND_GRACE_SEC);
                setOtp(""); // limpia OTP para evitar intentar con uno vencido
            } else if (otpPhase === "grace") {
                // se acabó la gracia -> cerrar
                handleClose();
            }
        }
    }, [open, step, otpSecondsLeft, otpPhase, onClose, setOtp]);

    const otpMMSS = useMemo(() => {
        const m = String(Math.floor(otpSecondsLeft / 60)).padStart(2, "0");
        const s = String(otpSecondsLeft % 60).padStart(2, "0");
        return `${m}:${s}`;
    }, [otpSecondsLeft]);

    const otpProgress = useMemo(() => {
        const total = otpPhase === "active" ? OTP_TTL_SEC : RESEND_GRACE_SEC;
        return Math.max(0, Math.min(100, (otpSecondsLeft / total) * 100));
    }, [otpSecondsLeft, otpPhase]);

    const canResend = step === "verify" && otpPhase === "grace" && !loading;

    // SweetAlert cuando termina ok
    useEffect(() => {
        if (!open) return;
        if (step !== "done") return;

        (async () => {
            await alert.success("Contraseña actualizada", "Tu cambio se realizó con éxito.");
            onClose?.();
        })();
    }, [step, open]);

    const requestBannerMsg = step === "request" ? (error || "") : "";
    const verifyBannerMsg = step === "verify" ? (error || "") : "";
    const confirmBannerMsg = step === "confirm" ? (error || "") : "";

    // Verificar OTP (solo en fase activa)
    const handleVerify = async () => {
        if (otpPhase !== "active") return;
        await verify();
    };

    const handleResend = async () => {
        await start(); // reenvía OTP
        setOtp("");
        setOtpPhase("active");
        setOtpSecondsLeft(OTP_TTL_SEC);
        alert.toastSuccess("OTP reenviado");
    };

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            size="sm"
            title="Recuperar contraseña"
            footer={
                <>
                    <Button
                        variant="outlined"
                        className="border-[#2B338C] text-[#2B338C] mr-2"
                        onClick={handleClose}
                    >
                        Cancelar
                    </Button>

                    {step === "request" && (
                        <Button
                            className="bg-[#FFDA00] text-[#2B338C]"
                            disabled={loading || correo.trim().length < 5}
                            onClick={start}
                        >
                            {loading ? "Enviando..." : "Enviar código"}
                        </Button>
                    )}

                    {step === "verify" && (
                        <Button
                            className="bg-[#FFDA00] text-[#2B338C]"
                            disabled={loading || otpPhase !== "active" || otp.trim().length < OTP_LEN}
                            onClick={handleVerify}
                        >
                            {loading ? "Verificando..." : "Verificar"}
                        </Button>
                    )}

                    {step === "confirm" && (
                        <Button
                            className="bg-[#FFDA00] text-[#2B338C]"
                            disabled={loading || tooShort || mismatch}
                            onClick={handleConfirm}
                        >
                            {loading ? "Guardando..." : "Cambiar contraseña"}
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-4">

                {step === "request" && (
                    <>
                        <Banner
                            type="info"
                            title="Aviso"
                            message="Si el correo existe en nuestra base de datos, recibirás un código OTP para continuar con el restablecimiento de las credenciales"
                        />

                        <Banner
                            type="error"
                            title="Error"
                            message={error}
                        />

                        <Typography className="text-sm text-blue-gray-700">
                            Ingresa tu correo y te enviaremos un código válido por 4 minutos.
                        </Typography>

                        <Input
                            label="Correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            autoFocus
                        />
                    </>
                )}

                {step === "verify" && (
                    <>
                        <Input label="Correo" value={correo} disabled />

                        <Banner
                            type="warning"
                            title="Aviso"
                            message="Si el correo está registrado en el sistema, se envió un código OTP para continuar con la recuperación."
                        />

                        <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
                            <div>
                                <Typography className="text-sm font-semibold text-blue-gray-900">
                                    Verificación OTP
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-600">
                                    {otpPhase === "active"
                                        ? "Ingresa el código para continuar."
                                        : "El código venció. Reenvía uno nuevo antes de que se cierre."}
                                </Typography>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="relative grid h-12 w-12 place-items-center rounded-full"
                                    style={{
                                        background: `conic-gradient(#2563eb ${otpProgress}%, #e5e7eb 0)`,
                                    }}
                                    aria-label="Temporizador OTP"
                                >
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
                                        <Typography
                                            variant="small"
                                            className="text-xs font-semibold tabular-nums text-blue-gray-900"
                                        >
                                            {otpMMSS}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Typography variant="small" className="font-medium text-blue-gray-700">
                                        Tiempo restante
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold ${otpPhase === "grace" ? "text-amber-700" : "text-blue-gray-900"
                                            }`}
                                    >
                                        {otpPhase === "active" ? "Activo" : "Reenvío"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {otpPhase === "grace" && (
                            <Banner
                                type="error"
                                title="Código expirado"
                                message="Tienes 1 minuto para reenviar un nuevo código. Si no lo haces, se cerrará la ventana."
                            />
                        )}

                        {verifyBannerMsg && (
                            <Banner type="error" title="Error" message={verifyBannerMsg} />
                        )}

                        <div className="rounded-xl border bg-gray-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <Typography className="text-sm font-medium text-blue-gray-800">
                                    Código OTP
                                </Typography>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={!canResend}
                                    className={`text-sm font-semibold ${canResend
                                            ? "text-blue-600 hover:text-blue-700"
                                            : "text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Reenviar
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <OtpBoxes
                                    length={OTP_LEN}
                                    value={otp}
                                    onChange={(val) => setOtp(val)}
                                    disabled={loading || otpPhase !== "active"}
                                />
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <Typography variant="small" className="text-blue-gray-600">
                                    Ingresa {OTP_LEN} dígitos.
                                </Typography>

                                <Typography variant="small" className="text-blue-gray-500">
                                    Puedes pegar el código completo.
                                </Typography>
                            </div>
                        </div>
                    </>
                )}

                {step === "confirm" && (
                    <>
                        <Banner type="error" title="Error" message={confirmBannerMsg} />

                        <Input
                            label="Nueva contraseña"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoFocus
                        />

                        {tooShort && (
                            <Typography className="text-xs text-gray-600">
                                Mínimo 8 caracteres.
                            </Typography>
                        )}

                        <Input
                            label="Confirmar contraseña"
                            type="password"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                        />

                        {mismatch && (
                            <Typography className="text-xs text-red-600">
                                Las contraseñas no coinciden.
                            </Typography>
                        )}
                    </>
                )}

                {step === "done" && (
                    <Typography className="text-sm text-blue-gray-600">
                        Procesando...
                    </Typography>
                )}
            </div>
        </AppModal>
    );
}