// components/ui/buttons/RefreshButton.jsx
import { Button } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function RefreshButton({
  onClick,
  label = "Refrescar",
  className = "",
  ...props
}) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      className={`
        border-green-600 text-green-700
        flex items-center gap-2
        ${className}
      `}
      {...props}
    >
      <ArrowPathIcon className="h-4 w-4" />
      {label}
    </Button>
  );
}
