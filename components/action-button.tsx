import { cn } from "@/lib/utils";
import {
  Delete,
  Edit,
  FilterIcon,
  Loader,
  Save,
  Search,
  X,
} from "lucide-react";
import { FC } from "react";
import { Button } from "./ui/button";

type props = {
  icon?: boolean;
  title?: string | null;
  type?: string;
  url?: string | null;
  size?: "default" | "sm" | "xs" | "lg" | "icon";
  variant?: any;
  onClick?: () => void;
  buttonType?: "button" | "submit" | "reset";
  loading?: boolean;
  hover?: boolean;
  hoverClass?: string | null;
  className?: string | null;
  unstyle?: boolean;
};

const ActionButton: FC<props> = ({
  icon = true,
  title = null,
  type = "edit",
  size = "sm",
  variant = "outline",
  onClick = () => {},
  buttonType = "button",
  loading = false,
  hover = false,
  hoverClass = null,
  className = null,
  unstyle = false,
}) => {
  const ButtonIcon = () => {
    if (type === "edit") {
      return <Edit />;
    }
    if (type === "cancel") {
      return <X />;
    }
    if (type === "save") {
      return <Save />;
    }
    if (type === "delete") {
      return <Delete />;
    }
    if (type === "search") {
      return <Search />;
    }
    if (type === "filter") {
      return <FilterIcon />;
    }
  };
  return (
    <>
      <Button
        type={buttonType}
        className={cn(
          className && className,
          hover && !unstyle && "hover:bg-primary hover:text-white",
          hoverClass && hoverClass,
          unstyle && "p-0 shadow-none border-0 hover:bottom-0 hover:shadow-none"
        )}
        variant={variant}
        size={size}
        onClick={onClick}
      >
        <div className="flex gap-1">
          {icon && !loading && (
            <div className="flex justify-center items-center">
              <ButtonIcon />
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin" />
            </div>
          )}
          {title && (
            <div className="flex justify-center items-center capitalize">
              {title}
            </div>
          )}
        </div>
      </Button>
    </>
  );
};

export default ActionButton;
