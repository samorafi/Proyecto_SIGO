// components/ui/buttons/ClearFiltersButton.jsx
import { Button } from "@material-tailwind/react";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function ClearFiltersButton({
  onClick,
  label = "Limpiar",
  className = "",
  ...props
}) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      className={`
        border-[#2B338C] text-[#2B338C]
        flex items-center gap-2
        hover:bg-[#2B338C]/10
        transition-all
        ${className}
      `}
      {...props}
    >
      <XCircleIcon className="h-4 w-4" />
      {label}
    </Button>
  );
}
