import { AppLayout } from "@/components/AppLayout";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Reclamation, Categorie } from "@/lib/types";
import { STATUT_CONFIG, STATUT_ORDER, CHART_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ClipboardList, Timer, TrendingUp, Layers } from "lucide-react";
import { differenceInHours, format, subMonths, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: recs = [] } = useQuery({
    queryKey: ["admin-recs"],
    queryFn: async () => {
      const { data } = await db.from("reclamations").select("*");
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

  const total = recs.length;
  const closed = recs.filter((r) => r.date_cloture);
  const tauxResolution = total ? Math.round((recs.filter((r) => r.statut === "resolue" || r.statut === "cloturee").length / total) * 100) : 0;
  const delaiMoyen = closed.length
    ? Math.round(closed.reduce((s, r) => s + differenceInHours(new Date(r.date_cloture!), new Date(r.created_at)), 0) / closed.length)
    : 0;

  const statutData = STATUT_ORDER.map((s) => ({
    name: STATUT_CONFIG[s].label,
    value: recs.filter((r) => r.statut === s).length,
  })).filter((d) => d.value > 0);

  const catData = cats.map((c) => ({
    name: c.nom,
    value: recs.filter((r) => r.categorie_id === c.id).length,
  })).filter((d) => d.value > 0);

  const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
  const lineData = months.map((m) => ({
    mois: format(m, "MMM", { locale: fr }),
    recues: recs.filter((r) => isSameMonth(new Date(r.created_at), m)).length,
    resolues: recs.filter((r) => r.date_cloture && isSameMonth(new Date(r.date_cloture), m)).length,
  }));

  return (
    <AppLayout title="Tableau de bord" description="Vue d'ensemble des réclamations">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total réclamations" value={total} icon={ClipboardList} tint="bg-navy-muted text-navy" />
        <Kpi label="Délai moyen" value={`${delaiMoyen}h`} icon={Timer} tint="bg-status-encours-bg text-status-encours" />
        <Kpi label="Taux de résolution" value={`${tauxResolution}%`} icon={TrendingUp} tint="bg-status-resolue-bg text-status-resolue" />
        <Kpi label="Catégories" value={cats.length} icon={Layers} tint="bg-gold-muted text-gold" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Évolution mensuelle</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="recues" name="Reçues" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="resolues" name="Résolues" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Par statut</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statutData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statutData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {statutData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Répartition par catégorie</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" outerRadius={95} label>
                {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Kpi({ label, value, icon: Icon, tint }: { label: string; value: number | string; icon: React.ElementType; tint: string }) {
  return (
    <Card><CardContent className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </CardContent></Card>
  );
}
