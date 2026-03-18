"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const drawerContentVariants = cva(
  "fixed z-50 flex flex-col border bg-background transition-transform duration-300 ease-in-out outline-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 rounded-b-[10px] border-b",
        bottom: "inset-x-0 bottom-0 rounded-t-[10px] border-t",
        left: "inset-y-0 left-0 h-full rounded-r-[10px] border-r",
        right: "inset-y-0 right-0 h-full rounded-l-[10px] border-l",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        full: "",
      },
    },
    compoundVariants: [
      { side: ["top", "bottom"], size: "sm", class: "h-[30vh]" },
      { side: ["top", "bottom"], size: "md", class: "h-[60vh]" },
      { side: ["top", "bottom"], size: "lg", class: "h-[85vh]" },
      { side: ["top", "bottom"], size: "full", class: "h-screen" },
      { side: ["left", "right"], size: "sm", class: "w-[300px] sm:w-[350px]" },
      { side: ["left", "right"], size: "md", class: "w-[400px] sm:w-[500px]" },
      { side: ["left", "right"], size: "lg", class: "w-[600px] sm:w-[700px]" },
      { side: ["left", "right"], size: "full", class: "w-screen" },
    ],
    defaultVariants: {
      side: "bottom",
      size: "md",
    },
  }
);

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {
  showHandle?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = "bottom", size, showHandle, ...props }, ref) => {
  const shouldShowHandle = showHandle ?? side === "bottom";

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(drawerContentVariants({ side, size }), className)}
        {...props}
      >
        {shouldShowHandle && (
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export interface MyDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
}

export function MyDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = "md",
  side = "bottom",
  className,
  showHandle,
  showCloseButton = true,
}: MyDrawerProps) {
  const { t } = useTranslation();
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={side}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        side={side}
        size={size}
        showHandle={showHandle}
        className={className}
      >
        {(title || description || showCloseButton) && (
          <DrawerHeader className="relative">
            {showCloseButton && (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-6 w-6 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            )}
            {title && <DrawerTitle>{t(title as string)}</DrawerTitle>}
            {description && (
              <DrawerDescription>{t(description as string)}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">{children}</div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
