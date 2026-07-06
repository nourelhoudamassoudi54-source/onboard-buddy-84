import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Reclamation, Categorie, ReclamationStatut } from "@/lib/types";
import { STATUT_CONFIG, STATUT_ORDER } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FilePlus2, Search } from "lucide-react";
import { format } from "date-fns";

export default function ClientReclamations() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState<string>("all");

  const { data: recs = [] } = useQuery({
    queryKey: ["client-all", user?.id],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*")
        .eq("client_id", user!.id).order("created_at", { ascending: false });
      return (data as Reclamation[]) ?? [];
    },
    enabled: !!user,
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await db.from("categories").select("*");
      return (data as Categorie[]) ?? [];
    },
  });
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.nom ?? "—";

  const filtered = recs.filter((r) =>
    (statut === "all" || r.statut === statut) &&
    (q === "" || r.titre.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppLayout title="Mes réclamations" description="Toutes vos réclamations"
      actions={<Button asChild><Link to="/client/nouvelle"><FilePlus2 className="mr-2 h-4 w-4" />Nouvelle</Link></Button>}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUT_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune réclamation.</p>}
        {filtered.map((r) => (
          <Link key={r.id} to={`/reclamations/${r.id}`}>
            <Card className="transition-shadow hover:shadow-elevated">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.titre}</p>
                  <p className="text-xs text-muted-foreground">{catName(r.categorie_id)} · {format(new Date(r.created_at), "dd/MM/yyyy")}</p>
                </div>
                <UrgenceBadge urgence={r.urgence} />
                <StatusBadge statut={r.statut} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
