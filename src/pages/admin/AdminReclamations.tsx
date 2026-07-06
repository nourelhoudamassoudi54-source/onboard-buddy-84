import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { db } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Reclamation, Categorie, Profile, UserRoleRow } from "@/lib/types";
import { STATUT_CONFIG, STATUT_ORDER } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminReclamations() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("all");

  const { data: recs = [] } = useQuery({
    queryKey: ["admin-all-recs"],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*").order("created_at", { ascending: false });
      return (data as Reclamation[]) ?? [];
    },
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await db.from("categories").select("*");
      return (data as Categorie[]) ?? [];
    },
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: roles } = await db.from("user_roles").select("user_id").eq("role", "agent");
      const ids = ((roles as UserRoleRow[]) ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data } = await db.from("profiles").select("*").in("id", ids);
      return (data as Profile[]) ?? [];
    },
  });

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.nom ?? "—";
  const agentName = (id: string | null) => {
    const a = agents.find((x) => x.id === id);
    return a ? `${a.prenom} ${a.nom}` : "Non affecté";
  };

  const assign = async (recId: string, agentId: string) => {
    const { error } = await db.from("reclamations")
      .update({ agent_id: agentId, statut: "en_cours" }).eq("id", recId);
    if (error) { toast.error(error.message); return; }
    toast.success("Réclamation affectée");
    qc.invalidateQueries({ queryKey: ["admin-all-recs"] });
  };

  const filtered = recs.filter((r) =>
    (statut === "all" || r.statut === statut) &&
    (q === "" || r.titre.toLowerCase().includes(q.toLowerCase())),
  );

  const exportCsv = () => {
    const rows = [["Titre", "Categorie", "Statut", "Urgence", "Agent", "Créée le"]];
    filtered.forEach((r) => rows.push([
      r.titre, catName(r.categorie_id), STATUT_CONFIG[r.statut].label, r.urgence,
      agentName(r.agent_id), format(new Date(r.created_at), "dd/MM/yyyy"),
    ]));
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "reclamations.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="Réclamations" description="Supervisez et affectez les réclamations"
      actions={<Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {STATUT_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune réclamation.</p>}
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Link to={`/reclamations/${r.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium hover:underline">{r.titre}</p>
                <p className="text-xs text-muted-foreground">{catName(r.categorie_id)} · {format(new Date(r.created_at), "dd/MM/yyyy")}</p>
              </Link>
              <UrgenceBadge urgence={r.urgence} />
              <StatusBadge statut={r.statut} />
              <Select value={r.agent_id ?? "none"} onValueChange={(v) => v !== "none" && assign(r.id, v)}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Affecter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Affecter à…</SelectItem>
                  {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.prenom} {a.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
