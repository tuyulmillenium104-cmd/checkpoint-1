import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

/**
 * Skeleton variant for a text line.
 * @param lines - Number of lines to display
 * @param className - Additional classes
 */
function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton variant for an avatar/circular image.
 * @param size - Size of the avatar (sm, md, lg, xl)
 * @param className - Additional classes
 */
function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  )
}

/**
 * Skeleton variant for a card component.
 * @param className - Additional classes
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Skeleton variant for a table row.
 * @param columns - Number of columns
 * @param className - Additional classes
 */
function SkeletonTableRow({
  columns = 4,
  className,
}: {
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center space-x-4 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-[10%]" : "flex-1")}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton variant for a table with header and rows.
 * @param rows - Number of rows
 * @param columns - Number of columns
 * @param className - Additional classes
 */
function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-0", className)}>
      {/* Header */}
      <div className="flex items-center space-x-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === 0 ? "w-[10%]" : "flex-1")}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} className="border-b" />
      ))}
    </div>
  )
}

/**
 * Skeleton variant for a button.
 * @param size - Size of the button (sm, md, lg)
 * @param className - Additional classes
 */
function SkeletonButton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizeClasses = {
    sm: "h-8 w-16",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  }

  return <Skeleton className={cn("rounded-md", sizeClasses[size], className)} />
}

/**
 * Skeleton variant for an input field.
 * @param className - Additional classes
 */
function SkeletonInput({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-full rounded-md", className)} />
}

/**
 * Skeleton variant for an image placeholder.
 * @param aspectRatio - Aspect ratio (e.g., "16/9", "1/1", "4/3")
 * @param className - Additional classes
 */
function SkeletonImage({
  aspectRatio = "16/9",
  className,
}: {
  aspectRatio?: string
  className?: string
}) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio }}
    >
      <Skeleton className="absolute inset-0 rounded-md" />
    </div>
  )
}

/**
 * Skeleton variant for a list item.
 * @param className - Additional classes
 */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4 py-3", className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Skeleton variant for a notification/event alert card.
 * @param className - Additional classes
 */
function SkeletonAlert({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonButton,
  SkeletonInput,
  SkeletonImage,
  SkeletonListItem,
  SkeletonAlert,
}
