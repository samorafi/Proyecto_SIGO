// src/components/ui/PageTitle.jsx

import { Typography } from "@material-tailwind/react";

export default function PageTitle({ children, className = "" }) {
    return (
        <Typography
            className={`
                text-2xl 
                font-extrabold 
                text-[#2B338C]
                ${className}
            `}
        >
            {children}
        </Typography>
    );
}
