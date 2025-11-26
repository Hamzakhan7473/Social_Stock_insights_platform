import { cn } from "@/lib/utils"

type BadgeProps = React.HTMLAttributes<HTMLDivElement>

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "text-xs uppercase tracking-[0.35em] text-emerald-300",
        className,
      )}
      {...props}
    />
  )
}

