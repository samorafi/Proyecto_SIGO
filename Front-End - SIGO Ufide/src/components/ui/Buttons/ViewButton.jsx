import { Button } from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/solid";

export default function ViewButton({ onClick }) {
    return (
        <Button
            variant="outlined"
            className="border-[#2B338C] text-[#2B338C] p-2"
            onClick={onClick}
        >
            <EyeIcon className="h-4 w-4" />
        </Button>
    );
}
