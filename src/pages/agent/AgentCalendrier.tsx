import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Reclamation } from "@/lib/types";
import { URGENCE_CONFIG } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInHours, addHours, format, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentCalendrier() {
  const { user } = useAuth();
  const { data: recs = [] } = useQuery({
    queryKey: ["agent-sla", user?.id],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*")
        .eq("agent_id", user!.id)
        .not("statut", "in", "(resolue,cloturee,rejetee)")
        .order("created_at");
      return (data as Reclamation[]) ?? [];
    },
    enabled: !!user,
  });

  const withSla = recs.map((r) => {
    const deadline = addHours(new Date(r.created_at), URGENCE_CONFIG[r.urgence].slaHeures);
    const hoursLeft = differenceInHours(deadline, new Date());
    return { rec: r, deadline, hoursLeft, overdue: isBefore(deadline, new Date()) };
  }).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const overdue = withSla.filter((x) => x.overdue);

  return (
    <AppLayout title="Calendrier des délais (SLA)" description="Échéances de traitement de vos réclamations">
      {overdue.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-status-rejetee/30 bg-status-rejetee-bg px-4 py-3 text-sm text-status-rejetee">
          <AlertTriangle className="h-4 w-4" /> {overdue.length} réclamation(s) en dépassement de délai
        </div>
      )}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-4 w-4" />Échéances à venir</CardTitle></CardHeader>
        <CardContent className="p-0">
          {withSla.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune réclamation en cours.</p>
          ) : (
            <div className="divide-y divide-border">
              {withSla.map(({ rec, deadline, hoursLeft, overdue }) => (
                <Link key={rec.id} to={`/reclamations/${rec.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{rec.titre}</p>
                    <p className="text-xs text-muted-foreground">Échéance : {format(deadline, "dd MMM yyyy 'à' HH:mm", { locale: fr })}</p>
                  </div>
                  <UrgenceBadge urgence={rec.urgence} />
                  <StatusBadge statut={rec.statut} />
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold",
                    overdue ? "bg-status-rejetee-bg text-status-rejetee" :
                    hoursLeft < 12 ? "bg-status-encours-bg text-status-encours" : "bg-status-resolue-bg text-status-resolue")}>
                    {overdue ? `En retard (${Math.abs(hoursLeft)}h)` : `${hoursLeft}h restantes`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
