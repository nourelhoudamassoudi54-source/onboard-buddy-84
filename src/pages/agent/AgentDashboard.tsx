import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Reclamation, Categorie } from "@/lib/types";
import { STATUT_CONFIG, STATUT_ORDER, URGENCE_CONFIG } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("all");
  const [urgence, setUrgence] = useState("all");
  const [cat, setCat] = useState("all");

  const { data: recs = [] } = useQuery({
    queryKey: ["agent-recs", user?.id],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*")
        .eq("agent_id", user!.id).order("created_at", { ascending: false });
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
    (urgence === "all" || r.urgence === urgence) &&
    (cat === "all" || r.categorie_id === cat) &&
    (q === "" || r.titre.toLowerCase().includes(q.toLowerCase())),
  );

  const stats = {
    total: recs.length,
    encours: recs.filter((r) => r.statut === "nouvelle" || r.statut === "en_cours").length,
    resolues: recs.filter((r) => r.statut === "resolue" || r.statut === "cloturee").length,
  };

  return (
    <AppLayout title="Réclamations affectées" description="Gérez les réclamations qui vous sont assignées">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Affectées" value={stats.total} icon={Inbox} tint="bg-navy-muted text-navy" />
        <Stat label="À traiter" value={stats.encours} icon={Clock} tint="bg-status-encours-bg text-status-encours" />
        <Stat label="Traitées" value={stats.resolues} icon={CheckCircle2} tint="bg-status-resolue-bg text-status-resolue" />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {STATUT_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={urgence} onValueChange={setUrgence}>
          <SelectTrigger><SelectValue placeholder="Urgence" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes urgences</SelectItem>
            {(["faible","moyen","eleve"] as const).map((u) => <SelectItem key={u} value={u}>{URGENCE_CONFIG[u].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune réclamation affectée.</p>}
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

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: React.ElementType; tint: string }) {
  return (
    <Card><CardContent className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </CardContent></Card>
  );
}
