// src/components/ui/AppModal.jsx
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button
} from "@material-tailwind/react";

export default function AppModal({
    open,
    onClose,
    title,
    children,
    footer,
    size = "md",
    className = "",
}) {
    return (
        <Dialog
            open={open}
            handler={onClose}
            size={size}
            className={`rounded-xl shadow-xl bg-white ${className}`}
        >
            {/* HEADER */}
            <DialogHeader className="bg-[#2B338C] text-white font-semibold text-base px-6 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
                <span className="w-2.5 h-2.5 bg-[#FFDA00] rounded-full"></span>
                <span>{title}</span>
            </DialogHeader>

            {/* BODY (contenido dinámico) */}
            <DialogBody className="p-6 bg-gray-50 border-x border-b border-gray-200">
                {children}
            </DialogBody>

            {/* FOOTER: lo recibe desde afuera */}
            <DialogFooter className="bg-gray-50 border-t border-gray-200 px-5 py-3 rounded-b-xl flex justify-end">
                {footer}
            </DialogFooter>
        </Dialog>
    );
}
