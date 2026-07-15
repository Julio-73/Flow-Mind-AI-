"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollArea> & {
    viewportRef?: React.Ref<HTMLDivElement>;
  }
>(({ className, children, viewportRef, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollArea
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaViewport
      ref={viewportRef}
      className="h-full w-full rounded-[inherit] [&>div]:!block"
    >
      {children}
    </ScrollAreaPrimitive.ScrollAreaViewport>
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation="vertical"
      className="flex touch-none select-none transition-colors h-full w-1.5 rounded-full bg-transparent hover:bg-border/50 data-[state=visible]:bg-border/30"
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
    <ScrollAreaPrimitive.ScrollAreaCorner />
  </ScrollAreaPrimitive.ScrollArea>
));
ScrollArea.displayName = ScrollAreaPrimitive.ScrollArea.displayName;

export { ScrollArea };
