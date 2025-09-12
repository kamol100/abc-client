"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FC, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditIcon } from "./icon";
import { Button } from "./ui/button";
type props = {
  children?: ReactNode;
  title?: string;
  description?: string;
  trigger: string;
  Icon?: React.ComponentType<any>;
  footer?: boolean;
};

export const DialogWrapper: FC<props> = ({
  children,
  title = "test",
  description = " ",
  trigger = "Open dialog",
  Icon = undefined,
  footer = false,
}) => {
  const [isOpen, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "Edit" ? (
          <div className="cursor-pointer">
            <EditIcon />
          </div>
        ) : (
          <div className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            {trigger} {Icon && <Icon />}
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[600px] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t(title)}</DialogTitle>
          {description && (
            <DialogDescription>{t(description)}</DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {children &&
          typeof children === "object" &&
          "type" in (children as any) ? (
            // @ts-expect-error: children may not be a valid React element, but we check above
            <children.type {...(children as any)?.props} onClose={onClose} />
          ) : (
            children
          )}
        </div>
        {footer && (
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
