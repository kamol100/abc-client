import { cn } from "@/lib/utils";
import {
  Edit,
  FilterIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { forwardRef, ReactNode } from "react";
import { Button, type ButtonProps } from "./ui/button";

const ACTION_ICONS = {
  edit: Edit,
  cancel: X,
  save: Save,
  delete: Trash2,
  search: Search,
  filter: FilterIcon,
  create: Plus,
  add: Plus,
} as const;

type ActionType = keyof typeof ACTION_ICONS;

interface ActionButtonProps extends Omit<ButtonProps, "children" | "asChild"> {
  action?: ActionType;
  icon?: boolean;
  title?: string;
  children?: ReactNode;
  loading?: boolean;
  url?: string;
  unstyled?: boolean;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      action = "edit",
      icon = true,
      title,
      children,
      loading = false,
      url,
      unstyled = false,
      variant = "outline",
      size = "sm",
      className = "hover:bg-primary hover:text-primary-foreground",
      disabled,
      ...props
    },
    ref
  ) => {
    const Icon = action ? ACTION_ICONS[action] : null;

    const content = children ?? (
      <>
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          icon && Icon && <Icon />
        )}
        {title && <span className="capitalize">{title}</span>}
      </>
    );

    const sharedProps = {
      variant: unstyled ? ("ghost" as const) : variant,
      size,
      className: cn(
        unstyled &&
        "p-0 shadow-none border-0 hover:bg-transparent hover:shadow-none",
        className
      ),
      disabled: disabled || loading,
      ...props,
    };

    if (url) {
      return (
        <Button asChild {...sharedProps}>
          <Link href={url}>{content}</Link>
        </Button>
      );
    }

    return (
      <Button ref={ref} {...sharedProps}>
        {content}
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
export type { ActionButtonProps, ActionType };
