"use client";

import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbSegment {
  id: string;
  label: string;
}

export function ExplorerBreadcrumb({
  segments,
  onNavigate,
  className,
}: {
  segments: BreadcrumbSegment[];
  onNavigate: (id: string) => void;
  className?: string;
}) {
  return (
    <nav
      aria-label="Ruta de carpetas"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border bg-secondary/30 px-3 py-2 text-sm",
        className,
      )}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={seg.id} className="inline-flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" /> : null}
            <button
              type="button"
              disabled={isLast}
              onClick={() => onNavigate(seg.id)}
              className={cn(
                "inline-flex max-w-[12rem] items-center gap-1 truncate rounded px-1 py-0.5 transition-colors",
                isLast
                  ? "cursor-default font-medium text-foreground"
                  : "text-primary hover:bg-secondary hover:underline",
              )}
            >
              {i === 0 ? <Home className="size-3.5 shrink-0" /> : null}
              <span className="truncate">{seg.label}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}
