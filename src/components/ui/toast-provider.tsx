"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

interface ProfessionalToast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  progress?: number
}

interface ToastContextValue {
  toasts: ProfessionalToast[]
  addToast: (toast: Omit<ProfessionalToast, "id" | "progress">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

/**
 * Hook to access the professional toast system.
 */
export function useProfessionalToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useProfessionalToast must be used within a ProfessionalToastProvider")
  }
  return context
}

const toastTypeConfig = {
  success: {
    icon: CheckCircle,
    className: "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30",
    iconClassName: "text-green-500",
    titleClassName: "text-green-800 dark:text-green-200",
    descriptionClassName: "text-green-700 dark:text-green-300",
  },
  error: {
    icon: XCircle,
    className: "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30",
    iconClassName: "text-red-500",
    titleClassName: "text-red-800 dark:text-red-200",
    descriptionClassName: "text-red-700 dark:text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
    iconClassName: "text-amber-500",
    titleClassName: "text-amber-800 dark:text-amber-200",
    descriptionClassName: "text-amber-700 dark:text-amber-300",
  },
  info: {
    icon: Info,
    className: "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-800 dark:text-blue-200",
    descriptionClassName: "text-blue-700 dark:text-blue-300",
  },
}

/**
 * Individual toast item with progress bar.
 */
function ProfessionalToastItem({
  toast,
  onRemove,
}: {
  toast: ProfessionalToast
  onRemove: (id: string) => void
}) {
  const [progress, setProgress] = React.useState(100)
  const duration = toast.duration || 5000
  const config = toastTypeConfig[toast.type]
  const Icon = config.icon

  React.useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const updateProgress = () => {
      const now = Date.now()
      const remaining = endTime - now
      const newProgress = (remaining / duration) * 100

      if (newProgress <= 0) {
        onRemove(toast.id)
      } else {
        setProgress(Math.max(0, newProgress))
      }
    }

    const interval = setInterval(updateProgress, 50)

    return () => clearInterval(interval)
  }, [duration, toast.id, onRemove])

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
        "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        config.className
      )}
    >
      {/* Icon */}
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconClassName)} />

      {/* Content */}
      <div className="flex-1 grid gap-1">
        <ToastTitle className={cn("text-sm font-semibold", config.titleClassName)}>
          {toast.title}
        </ToastTitle>
        {toast.description && (
          <ToastDescription className={cn("text-sm", config.descriptionClassName)}>
            {toast.description}
          </ToastDescription>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity",
          "hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
          "group-hover:opacity-100"
        )}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className={cn("h-full transition-all duration-100 ease-linear", {
            "bg-green-500": toast.type === "success",
            "bg-red-500": toast.type === "error",
            "bg-amber-500": toast.type === "warning",
            "bg-blue-500": toast.type === "info",
          })}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Toast container that handles stacking and positioning.
 */
function ToastContainer() {
  const { toasts, removeToast } = useProfessionalToast()

  return (
    <div
      className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:max-w-[420px]"
      style={{ gap: "8px" }}
    >
      {toasts.map((toast) => (
        <ProfessionalToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

/**
 * Professional Toast Provider with success, error, warning, and info types.
 * Features auto-dismiss with progress bar and stacking capability.
 */
export function ProfessionalToastProvider({
  children,
  maxToasts = 5,
}: {
  children: React.ReactNode
  maxToasts?: number
}) {
  const [toasts, setToasts] = React.useState<ProfessionalToast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<ProfessionalToast, "id" | "progress">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newToast: ProfessionalToast = {
        ...toast,
        id,
        progress: 100,
        duration: toast.duration || 5000,
      }

      setToasts((prev) => {
        // Stack toasts, but limit to maxToasts
        const newToasts = [...prev, newToast]
        if (newToasts.length > maxToasts) {
          return newToasts.slice(-maxToasts)
        }
        return newToasts
      })
    },
    [maxToasts]
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
    }),
    [toasts, addToast, removeToast, clearToasts]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

/**
 * Convenience functions for showing different toast types.
 */
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    // This will be called from a component that has access to the context
    // Usage: const { addToast } = useProfessionalToast(); toast.success(...)
    return { type: "success" as ToastType, title, description, duration }
  },
  error: (title: string, description?: string, duration?: number) => {
    return { type: "error" as ToastType, title, description, duration }
  },
  warning: (title: string, description?: string, duration?: number) => {
    return { type: "warning" as ToastType, title, description, duration }
  },
  info: (title: string, description?: string, duration?: number) => {
    return { type: "info" as ToastType, title, description, duration }
  },
}

/**
 * Higher-order component that provides toast methods.
 * Use this to wrap components that need toast functionality.
 */
export function withToast<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <ProfessionalToastProvider>
        <Component {...props} />
      </ProfessionalToastProvider>
    )
  }
}
