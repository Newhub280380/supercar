import * as React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  returning: "bg-muted text-foreground",
  vip: "bg-gold/20 text-foreground border-gold/30",
  default: "bg-muted text-foreground",
};

const SKIN_TYPE_COLORS: Record<string, string> = {
  dry: "bg-amber-200/60",
  oily: "bg-sky-200/60",
  combination: "bg-purple-200/60",
  sensitive: "bg-rose-200/60",
  normal: "bg-green-200/60",
};

interface ClientBadgeProps {
  clientName: string;
  status?: "new" | "returning" | "vip";
  skinType?: string | null;
  size?: "sm" | "md";
}

function ClientBadge({
  clientName,
  status = "new",
  skinType = null,
  size = "md",
}: ClientBadgeProps) {
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = size === "sm" ? "h-7" : "h-8";
  const avatarSize = size === "sm" ? "size-6" : "size-7";
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  const skinDot = size === "sm" ? "size-1.5" : "size-2";

  return (
    <Badge
      variant="outline"
      className={`${STATUS_STYLES[status] ?? STATUS_STYLES.default} flex items-center gap-1.5 ${sizeClass} gap-2 border-border/60`}
    >
      <span
        className={`${avatarSize} flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary`}
      >
        {initials}
      </span>
      <span className={`${textClass} truncate`}>{clientName}</span>
      {skinType && (
        <span
          className={`${skinDot} shrink-0 rounded-full ${
            SKIN_TYPE_COLORS[skinType.toLowerCase()] ?? "bg-gray-200"
          }`}
          title={skinType}
        />
      )}
      {status === "vip" && (
        <Star className="size-3 shrink-0 fill-gold stroke-gold" />
      )}
    </Badge>
  );
}

export { ClientBadge };
