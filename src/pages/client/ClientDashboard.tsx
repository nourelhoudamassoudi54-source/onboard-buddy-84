import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Reclamation } from "@/lib/types";
import { STATUT_CONFIG } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { data: recs = [] } = useQuery({
    queryKey: ["client-recs", user?.id],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*")
        .eq("client_id", user!.id).order("created_at", { ascending: false });
      return (data as Reclamation[]) ?? [];
    },
    enabled: !!user,
  });

  const stats = {
    total: recs.length,
    encours: recs.filter((r) => r.statut === "en_cours" || r.statut === "nouvelle").length,
    resolues: recs.filter((r) => r.statut === "resolue" || r.statut === "cloturee").length,
  };

  return (
    <AppLayout
      title={`Bonjour ${profile?.prenom ?? ""}`}
      description="Suivez l'état de vos réclamations"
      actions={
        <Button asChild><Link to="/client/nouvelle"><FilePlus2 className="mr-2 h-4 w-4" />Nouvelle réclamation</Link></Button>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={stats.total} icon={ClipboardList} tint="bg-navy-muted text-navy" />
        <StatCard label="En traitement" value={stats.encours} icon={Clock} tint="bg-status-encours-bg text-status-encours" />
        <StatCard label="Résolues" value={stats.resolues} icon={CheckCircle2} tint="bg-status-resolue-bg text-status-resolue" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Réclamations récentes</h2></div>
          {recs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune réclamation. Déposez-en une !</p>
          ) : (
            <div className="divide-y divide-border">
              {recs.slice(0, 6).map((r) => (
                <Link key={r.id} to={`/reclamations/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.titre}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy")}</p>
                  </div>
                  <UrgenceBadge urgence={r.urgence} />
                  <StatusBadge statut={r.statut} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: number; icon: React.ElementType; tint: string }) {
  return (
    <Card><CardContent className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </CardContent></Card>
  );
}
