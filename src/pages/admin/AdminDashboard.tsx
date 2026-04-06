import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StatCard, PageHeader, ProgressBar } from '@/components/shared/DashboardWidgets';
import { mockKPI, mockParcours, mockUsers, mockChartData, mockPieData } from '@/data/mock-data';
import { Users, CheckSquare, Route, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => (
  <DashboardLayout>
    <PageHeader title="Dashboard Admin RH" description="Vue d'ensemble de l'onboarding" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Total salariés" value={mockKPI.totalSalaries} icon={Users} trend="+3 ce mois" trendUp colorClass="text-admin" />
      <StatCard label="Parcours actifs" value={mockKPI.parcoursActifs} icon={Route} trend="+2 cette semaine" trendUp colorClass="text-manager" />
      <StatCard label="Tâches terminées" value={mockKPI.nbTachesTerminees} icon={CheckSquare} colorClass="text-salarie" />
      <StatCard label="Tâches en retard" value={mockKPI.nbTachesEnRetard} icon={AlertTriangle} colorClass="text-destructive" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Onboardings par mois</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <Tooltip />
            <Bar dataKey="onboardes" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} name="Onboardés" />
            <Bar dataKey="termines" fill="hsl(152,69%,40%)" radius={[4, 4, 0, 0]} name="Terminés" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Statut des parcours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={mockPieData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
              {mockPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-2">
          {mockPieData.map(d => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-medium text-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Recent parcours */}
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-card">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Parcours récents</h3>
      </div>
      <div className="divide-y divide-border">
        {mockParcours.map(p => (
          <div key={p.id} className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-admin-muted flex items-center justify-center text-sm font-semibold text-admin">
              {p.salarie?.prenom[0]}{p.salarie?.nom[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{p.salarie?.prenom} {p.salarie?.nom}</p>
              <p className="text-xs text-muted-foreground">{p.intitule}</p>
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{p.progression}%</span>
              </div>
              <ProgressBar value={p.progression} colorClass="bg-admin" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </DashboardLayout>
);

export default AdminDashboard;
