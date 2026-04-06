import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatCard } from '@/components/shared/DashboardWidgets';
import { TrendingUp, CheckSquare, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const perfData = [
  { name: 'En avance', value: 45, fill: 'hsl(152, 69%, 40%)' },
  { name: 'Dans les temps', value: 35, fill: 'hsl(270, 67%, 47%)' },
  { name: 'En retard', value: 20, fill: 'hsl(0, 84%, 60%)' },
];

const weeklyData = [
  { jour: 'Lun', taches: 5 }, { jour: 'Mar', taches: 8 }, { jour: 'Mer', taches: 3 },
  { jour: 'Jeu', taches: 7 }, { jour: 'Ven', taches: 6 },
];

const ManagerReporting = () => (
  <DashboardLayout>
    <PageHeader title="Reporting" description="Indicateurs de performance de votre équipe" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Taux d'avancement" value="58%" icon={TrendingUp} colorClass="text-manager" />
      <StatCard label="Tâches terminées" value={14} icon={CheckSquare} colorClass="text-salarie" />
      <StatCard label="Tâches en retard" value={2} icon={Clock} colorClass="text-destructive" />
      <StatCard label="Complétion parcours" value="42%" icon={BarChart3} colorClass="text-manager" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tâches complétées par jour</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="jour" tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <Tooltip />
            <Bar dataKey="taches" fill="hsl(270,67%,47%)" radius={[4, 4, 0, 0]} name="Tâches" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance globale</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={perfData} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
              {perfData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-4">
          {perfData.map(d => (
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
  </DashboardLayout>
);

export default ManagerReporting;
