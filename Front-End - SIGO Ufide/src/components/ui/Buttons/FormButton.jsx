// src/components/ui/Buttons/FormButton.jsx

import { Button } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function FormButton({ children, className = "", ...props }) {
    return (
        <Button
            className={`
                bg-[#FFDA00]
                text-[#2B338C]
                font-semibold
                flex items-center gap-2
                ${className}
            `}
            {...props}
        >
            <PlusIcon className="h-5 w-5" />
            {children}
        </Button>
    );
}

