"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={`inline-flex min-h-11 items-center gap-1 rounded-md bg-surface-container-low p-1 text-slate-600 ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={`inline-flex min-h-9 items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 data-[state=active]:bg-card data-[state=active]:text-ink data-[state=active]:shadow-sm disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function TabsContent({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={`mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
      {...props}
    />
  );
}
