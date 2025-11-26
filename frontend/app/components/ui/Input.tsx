import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-base text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = "Input"

export { Input }

