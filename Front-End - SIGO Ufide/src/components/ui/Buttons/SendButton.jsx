import { Button } from "@material-tailwind/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function SendButton({ onClick }) {
    return (
        <Button
            variant="outlined"
            className="border-green-600 text-green-700 p-2"
            onClick={onClick}
        >
            <PaperAirplaneIcon className="h-4 w-4" />
        </Button>
    );
}
