import Image from "next/image";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/logo/Fondo Lead Manager.png";

export function Logo({
  className,
  height = 44,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="LeadManager"
      width={Math.round(height * 2.4)}
      height={height}
      className={cn("object-contain object-left", className)}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
