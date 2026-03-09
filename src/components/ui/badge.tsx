import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 px-2.5 py-0.5 text-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none font-[family-name:var(--font-pixel-body)] tracking-wider uppercase",
  {
    variants: {
      variant: {
        default:
          "bg-[#00fff7] text-[#0a0a0f] border-[#00fff7] shadow-[2px_2px_0_0_#0088ff]",
        secondary:
          "bg-[#1a1a2e] text-[#e0e0e0] border-[#2a2a4e] shadow-[2px_2px_0_0_#3a3a5e]",
        destructive:
          "bg-[#ff0040] text-white border-[#ff0040] shadow-[2px_2px_0_0_#aa0028]",
        outline:
          "bg-transparent text-[#00fff7] border-[#00fff7] shadow-[2px_2px_0_0_#00fff7]",
        pixel:
          "bg-[#39ff14] text-[#0a0a0f] border-[#39ff14] shadow-[2px_2px_0_0_#00aa00]",
        gold:
          "bg-[#ffd700] text-[#0a0a0f] border-[#ffd700] shadow-[2px_2px_0_0_#cc9900]",
        magenta:
          "bg-[#ff00ff] text-white border-[#ff00ff] shadow-[2px_2px_0_0_#aa00aa]",
        cyan:
          "bg-[#00fff7]/20 text-[#00fff7] border-[#00fff7]/50 shadow-[2px_2px_0_0_#00fff7/30]",
        lime:
          "bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/50 shadow-[2px_2px_0_0_#39ff14/30]",
        purple:
          "bg-[#9d00ff]/20 text-[#9d00ff] border-[#9d00ff]/50 shadow-[2px_2px_0_0_#9d00ff/30]",
        warning:
          "bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600]/50 shadow-[2px_2px_0_0_#ff6600/30]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
