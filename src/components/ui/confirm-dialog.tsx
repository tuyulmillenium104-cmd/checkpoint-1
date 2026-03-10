"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: React.ReactNode
  /** Dialog description */
  description?: React.ReactNode
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Callback when confirm is clicked */
  onConfirm: () => void | Promise<void>
  /** Callback when cancel is clicked */
  onCancel?: () => void
  /** Variant for the confirm button */
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"]
  /** Variant for the cancel button */
  cancelVariant?: VariantProps<typeof buttonVariants>["variant"]
  /** Whether the confirm action is loading */
  loading?: boolean
  /** Whether to show the cancel button */
  showCancel?: boolean
  /** Custom icon to display */
  icon?: React.ReactNode
  /** Additional className for the dialog content */
  className?: string
  /** Whether to close on confirm */
  closeOnConfirm?: boolean
}

/**
 * A reusable confirmation dialog component.
 * Supports keyboard navigation (Escape to close) and customizable button colors.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "default",
  cancelVariant = "outline",
  loading = false,
  showCancel = true,
  icon,
  className,
  closeOnConfirm = true,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      if (closeOnConfirm) {
        onOpenChange(false)
      }
    } catch (error) {
      // Let the parent handle the error
      console.error("Confirm action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      handleCancel()
    }
    if (event.key === "Enter" && !loading && !isLoading) {
      event.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-[425px]", className)}
        onKeyDown={handleKeyDown}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            {icon && (
              <div className="flex-shrink-0 mt-0.5">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          {showCancel && (
            <Button
              variant={cancelVariant}
              onClick={handleCancel}
              disabled={loading || isLoading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading || isLoading}
            className="min-w-[80px]"
          >
            {loading || isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Convenience function to create a confirm dialog with common presets.
 */
export const confirmDialogPresets = {
  destructive: {
    confirmVariant: "destructive" as const,
    confirmText: "Delete",
    cancelVariant: "outline" as const,
  },
  warning: {
    confirmVariant: "gold" as const,
    confirmText: "Proceed",
    cancelVariant: "outline" as const,
  },
  success: {
    confirmVariant: "pixel" as const,
    confirmText: "Confirm",
    cancelVariant: "outline" as const,
  },
  info: {
    confirmVariant: "default" as const,
    confirmText: "OK",
    cancelVariant: "outline" as const,
  },
}
