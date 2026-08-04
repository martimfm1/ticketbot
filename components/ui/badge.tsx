import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-zinc-300",
        outline: "border-white/10 text-zinc-400",
        success: "border-green-500/20 bg-green-500/10 text-green-400",
        warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        error: "border-red-500/20 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
