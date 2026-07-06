import { STATUT_CONFIG } from "@/lib/constants";
import { ReclamationStatut } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  statut,
  className,
}: {
  statut: ReclamationStatut;
  className?: string;
}) {
  const cfg = STATUT_CONFIG[statut];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        cfg.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
