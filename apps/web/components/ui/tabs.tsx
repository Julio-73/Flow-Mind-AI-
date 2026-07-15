"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "underline" | "pills" | "cards";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center",
      variant === "default" &&
        "h-9 rounded-lg bg-muted p-1 text-muted-foreground",
      variant === "underline" &&
        "border-b border-border space-x-6 h-10",
      variant === "pills" &&
        "flex-wrap gap-1",
      variant === "cards" &&
        "border-b border-border space-x-0 h-10",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const parent = React.useContext(TabsContext);
  const variant = parent?.variant || "default";

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 ease-flow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "rounded-md px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        variant === "underline" &&
          "px-1 py-1.5 border-b-2 border-transparent data-[state=active]:border-biolume data-[state=active]:text-biolume transition-all duration-200 ease-flow relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-biolume after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100",
        variant === "pills" &&
          "rounded-full px-3 py-1.5 data-[state=active]:bg-biolume data-[state=active]:text-void data-[state=active]:font-semibold",
        variant === "cards" &&
          "px-4 py-2.5 border border-border border-b-0 rounded-t-lg data-[state=active]:bg-card data-[state=active]:border-b-card -mb-px",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

const TabsContext = React.createContext<{ variant?: string } | null>(null);

function TabsRootWithVariant({
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  variant?: "default" | "underline" | "pills" | "cards";
}) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <Tabs {...props} />
    </TabsContext.Provider>
  );
}

export {
  TabsRootWithVariant as Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};
