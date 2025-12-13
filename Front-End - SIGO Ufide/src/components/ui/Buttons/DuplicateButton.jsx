import { Button } from "@material-tailwind/react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";

export default function DuplicateButton({ children, className = "", ...props }) {
    return (
        <Button
            className={`
                bg-[#2B338C]
                text-white
                font-semibold
                flex items-center gap-2
                hover:bg-[#222A7A]
                transition
                ${className}
            `}
            {...props}
        >
            <DocumentDuplicateIcon className="h-5 w-5" />
            {children}
        </Button>
    );
}
