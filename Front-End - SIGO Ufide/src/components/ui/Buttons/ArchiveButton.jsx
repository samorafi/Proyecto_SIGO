// src/components/ui/Buttons/ArchiveButton.jsx

import { Button } from "@material-tailwind/react";
import { ArchiveBoxArrowDownIcon } from "@heroicons/react/24/solid";

export default function ArchiveButton({ children, className = "", ...props }) {
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
            <ArchiveBoxArrowDownIcon className="h-5 w-5" />
            {children}
        </Button>
    );
}
