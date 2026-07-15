"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "",
  accent: "card-accent-glow",
  success: "border-emerald-500/20 bg-emerald-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  danger: "border-destructive/20 bg-destructive/5",
};

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  loading,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold font-sora tabular-nums">{value}</div>
            <div className="mt-1 flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-medium tabular-nums",
                    trend.positive ? "text-emerald-500" : "text-destructive"
                  )}
                >
                  {trend.positive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
