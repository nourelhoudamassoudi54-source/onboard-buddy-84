import { URGENCE_CONFIG } from "@/lib/constants";
import { UrgenceNiveau } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUp, Minus } from "lucide-react";

const ICONS: Record<UrgenceNiveau, typeof Minus> = {
  faible: Minus,
  moyen: ArrowUp,
  eleve: AlertTriangle,
};

export function UrgenceBadge({
  urgence,
  className,
}: {
  urgence: UrgenceNiveau;
  className?: string;
}) {
  const cfg = URGENCE_CONFIG[urgence];
  const Icon = ICONS[urgence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cfg.badge,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
