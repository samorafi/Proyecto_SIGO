import { Button } from "@material-tailwind/react";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function CancelButton({ onClick }) {
    return (
        <Button
            variant="outlined"
            className="border-red-500 text-red-600 p-2"
            onClick={onClick}
        >
            <XCircleIcon className="h-4 w-4" />
        </Button>
    );
}
