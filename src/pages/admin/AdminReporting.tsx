import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatCard } from '@/components/shared/DashboardWidgets';
import { mockKPI, mockChartData, mockPieData } from '@/data/mock-data';
import { TrendingUp, CheckSquare, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const AdminReporting = () => (
  <DashboardLayout>
    <PageHeader title="Reporting & KPI" description="Statistiques détaillées et indicateurs de performance" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Taux d'avancement" value={`${mockKPI.tauxAvancement}%`} icon={TrendingUp} colorClass="text-admin" />
      <StatCard label="Taux complétion" value={`${mockKPI.tauxCompletionParcours}%`} icon={CheckSquare} colorClass="text-salarie" />
      <StatCard label="En retard" value={mockKPI.nbTachesEnRetard} icon={Clock} colorClass="text-destructive" />
      <StatCard label="Total salariés" value={mockKPI.totalSalaries} icon={Users} colorClass="text-manager" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Évolution des onboardings</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <Tooltip />
            <Line type="monotone" dataKey="onboardes" stroke="hsl(217,91%,50%)" strokeWidth={2} dot={{ r: 4 }} name="Onboardés" />
            <Line type="monotone" dataKey="termines" stroke="hsl(152,69%,40%)" strokeWidth={2} dot={{ r: 4 }} name="Terminés" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Répartition par statut</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={mockPieData} innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
              {mockPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>

    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Onboardings mensuels</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={mockChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
          <XAxis dataKey="mois" tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
          <Tooltip />
          <Bar dataKey="onboardes" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} name="Nouveaux" />
          <Bar dataKey="termines" fill="hsl(152,69%,40%)" radius={[4, 4, 0, 0]} name="Complétés" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  </DashboardLayout>
);

export default AdminReporting;
