"use client";

import { Folder, FolderOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FolderItem({
  label,
  subtitle,
  icon: Icon = Folder,
  open = false,
  selected = false,
  onOpen,
  onContextMenu,
  className,
}: {
  label: string;
  subtitle?: string;
  icon?: LucideIcon;
  open?: boolean;
  selected?: boolean;
  onOpen: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const FolderIcon = open ? FolderOpen : Icon;
  return (
    <button
      type="button"
      onClick={onOpen}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      className={cn(
        "group flex w-full flex-col items-center gap-2 rounded-lg border border-transparent p-4 text-center transition-colors",
        "hover:border-border hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/40 bg-primary/5",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-md transition-transform group-hover:scale-105",
          Icon === Folder || open ? "text-amber-500" : "text-primary",
        )}
      >
        <FolderIcon className="size-12 drop-shadow-sm" strokeWidth={1.25} />
      </span>
      <span className="w-full space-y-0.5">
        <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">{label}</p>
        {subtitle ? (
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </span>
    </button>
  );
}
