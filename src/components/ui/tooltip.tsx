"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  className,
  side = "top",
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 hidden w-max max-w-[220px] -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-center text-[11px] leading-snug text-white shadow-lg group-hover/tip:block group-focus-within/tip:block",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {content}
      </span>
    </span>
  );
}
