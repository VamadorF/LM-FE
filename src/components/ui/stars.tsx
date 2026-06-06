"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = "sm",
  showValue = false,
  count,
}: {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  count?: number;
}) {
  const px = size === "md" ? "size-5" : "size-4";
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300",
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-sm font-medium text-foreground">
          {value > 0 ? value.toFixed(1) : "Sin rating"}
          {count !== undefined && value > 0 ? (
            <span className="ml-1 text-xs font-normal text-muted-foreground">({count})</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} estrellas`}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-7",
              i <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300",
            )}
          />
        </button>
      ))}
    </span>
  );
}
