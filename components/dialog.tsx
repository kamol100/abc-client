"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

// --- Context: allows children (e.g. FormWrapper) to close the dialog ---
const DialogCloseContext = createContext<(() => void) | null>(null);

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

// --- Size variants ---
const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  fullscreen: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
} as const;

type DialogSize = keyof typeof sizeClasses;
type DialogVariant = "default" | "destructive";

// --- Props ---
interface DialogWrapperProps {
  title?: string;
  description?: string;
  children?: ReactNode;

  trigger?: ReactNode;

  // Controlled or uncontrolled open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;

  size?: DialogSize;
  variant?: DialogVariant;

  // Built-in actions (supports async with auto-loading)
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;

  // External loading override (e.g. from React Query isPending)
  loading?: boolean;

  // Render a fully custom footer, or pass ReactNode
  footer?:
    | ReactNode
    | ((props: { close: () => void; loading: boolean }) => ReactNode);

  preventCloseOnLoading?: boolean;
  autoCloseOnSuccess?: boolean;

  contentClassName?: string;
}

export function DialogWrapper({
  title,
  description,
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  size = "md",
  variant = "default",
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  showFooter,
  loading: externalLoading,
  footer,
  preventCloseOnLoading = true,
  autoCloseOnSuccess = true,
  contentClassName,
}: DialogWrapperProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const { t } = useTranslation();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const isLoading = externalLoading ?? asyncLoading;

  const setOpen = useCallback(
    (value: boolean) => {
      if (preventCloseOnLoading && isLoading && !value) return;
      if (!isControlled) setInternalOpen(value);
      controlledOnOpenChange?.(value);
    },
    [isControlled, controlledOnOpenChange, preventCloseOnLoading, isLoading]
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const handleConfirm = useCallback(async () => {
    if (!onConfirm || isLoading) return;

    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setAsyncLoading(true);
        await result;
      }
      if (autoCloseOnSuccess) close();
    } catch {
      // Error handling is delegated to the caller (e.g. toast in mutation onError)
    } finally {
      setAsyncLoading(false);
    }
  }, [onConfirm, isLoading, autoCloseOnSuccess, close]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    close();
  }, [onCancel, close]);

  const hasActions = onConfirm || onCancel;
  const shouldShowFooter = showFooter ?? (hasActions || !!footer);
  const confirmVariant = variant === "destructive" ? "destructive" : "default";

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn(sizeClasses[size], contentClassName)}
        onInteractOutside={isLoading ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isLoading ? (e) => e.preventDefault() : undefined}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{t(title)}</DialogTitle>}
            {description && (
              <DialogDescription>{t(description)}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {children && (
          <DialogCloseContext.Provider value={close}>
            <div className="grid gap-4 py-4">{children}</div>
          </DialogCloseContext.Provider>
        )}

        {shouldShowFooter && (
          <DialogFooter>
            {typeof footer === "function"
              ? footer({ close, loading: isLoading })
              : footer ?? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {t(cancelText ?? "cancel")}
                    </Button>
                    {onConfirm && (
                      <Button
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t(confirmText ?? "confirm")}
                      </Button>
                    )}
                  </>
                )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
