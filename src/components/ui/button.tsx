import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none font-[family-name:var(--font-pixel-body)] text-lg tracking-wider uppercase",
  {
    variants: {
      variant: {
        default:
          "bg-[#00fff7] text-[#0a0a0f] border-2 border-[#00fff7] shadow-[3px_3px_0_0_#0088ff] hover:shadow-[4px_4px_0_0_#0088ff] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#0088ff] active:translate-x-[2px] active:translate-y-[2px]",
        destructive:
          "bg-[#ff0040] text-white border-2 border-[#ff0040] shadow-[3px_3px_0_0_#aa0028] hover:shadow-[4px_4px_0_0_#aa0028] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#aa0028] active:translate-x-[2px] active:translate-y-[2px]",
        outline:
          "bg-transparent text-[#00fff7] border-2 border-[#00fff7] shadow-[3px_3px_0_0_#00fff7] hover:bg-[#00fff7]/10 hover:shadow-[4px_4px_0_0_#00fff7] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#00fff7] active:translate-x-[2px] active:translate-y-[2px] dark:bg-transparent dark:text-[#00fff7]",
        secondary:
          "bg-[#1a1a2e] text-[#e0e0e0] border-2 border-[#2a2a4e] shadow-[3px_3px_0_0_#2a2a4e] hover:bg-[#2a2a3e] hover:shadow-[4px_4px_0_0_#3a3a5e] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#2a2a4e] active:translate-x-[2px] active:translate-y-[2px]",
        ghost:
          "text-[#00fff7] border-2 border-transparent hover:bg-[#00fff7]/10 hover:border-[#00fff7]/50",
        link: "text-[#00fff7] underline-offset-4 hover:underline decoration-[#00fff7]/50",
        pixel:
          "bg-[#39ff14] text-[#0a0a0f] border-2 border-[#39ff14] shadow-[3px_3px_0_0_#00aa00] hover:shadow-[4px_4px_0_0_#00aa00] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#00aa00] active:translate-x-[2px] active:translate-y-[2px]",
        gold:
          "bg-[#ffd700] text-[#0a0a0f] border-2 border-[#ffd700] shadow-[3px_3px_0_0_#cc9900] hover:shadow-[4px_4px_0_0_#cc9900] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#cc9900] active:translate-x-[2px] active:translate-y-[2px]",
        magenta:
          "bg-[#ff00ff] text-white border-2 border-[#ff00ff] shadow-[3px_3px_0_0_#aa00aa] hover:shadow-[4px_4px_0_0_#aa00aa] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#aa00aa] active:translate-x-[2px] active:translate-y-[2px]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 py-1 text-base",
        lg: "h-12 px-8 py-3 text-xl",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
