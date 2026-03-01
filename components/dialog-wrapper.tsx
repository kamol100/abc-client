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
import ActionButton from "@/components/action-button";

const DialogCloseContext = createContext<(() => void) | null>(null);

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  fullscreen: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
} as const;

type DialogSize = keyof typeof sizeClasses;
type DialogVariant = "default" | "destructive";

interface DialogWrapperProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  size?: DialogSize;
  variant?: DialogVariant;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  loading?: boolean;
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
      // Error handling delegated to caller
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

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn(
          sizeClasses[size],
          "flex flex-col max-h-[90vh] gap-0",
          contentClassName
        )}
        onInteractOutside={isLoading ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isLoading ? (e) => e.preventDefault() : undefined}
      >
        {(title || description) && (
          <DialogHeader className="shrink-0 pb-4">
            {title && <DialogTitle>{t(title)}</DialogTitle>}
            {description && (
              <DialogDescription>{t(description)}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {children && (
          <DialogCloseContext.Provider value={close}>
            <div className="flex-1 overflow-y-auto min-h-0 px-0.5">
              {children}
            </div>
          </DialogCloseContext.Provider>
        )}

        {shouldShowFooter && (
          <DialogFooter className="shrink-0 border-t pt-4 mt-4 flex-row justify-between sm:flex-row sm:justify-between sm:space-x-0 gap-2">
            {typeof footer === "function"
              ? footer({ close, loading: isLoading })
              : footer ?? (
                <>
                  <ActionButton
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {t(cancelText ?? "cancel")}
                  </ActionButton>
                  {onConfirm && (
                    <ActionButton
                      action="save"
                      onClick={handleConfirm}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(confirmText ?? "confirm")}
                    </ActionButton>
                  )}
                </>
              )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
