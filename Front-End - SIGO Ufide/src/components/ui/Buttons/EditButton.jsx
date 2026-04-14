import { Button } from "@material-tailwind/react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function EditButton({ onClick }) {
    return (
        <Button
            className="bg-[#FFDA00] text-[#2B338C] p-2"
            onClick={onClick}
        >
            <PencilSquareIcon className="h-4 w-4" />
        </Button>
    );
}
