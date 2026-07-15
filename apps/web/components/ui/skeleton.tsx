"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "relative overflow-hidden bg-muted/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-biolume/10 before:to-transparent",
  {
    variants: {
      variant: {
        default: "rounded-md",
        text: "rounded h-4",
        circle: "rounded-full",
        card: "rounded-lg",
      },
      size: {
        default: "",
        sm: "h-8",
        md: "h-12",
        lg: "h-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
