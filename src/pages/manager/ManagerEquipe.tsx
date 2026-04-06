import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, ProgressBar } from '@/components/shared/DashboardWidgets';
import { mockUsers, mockParcours } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ManagerEquipe = () => {
  const [search, setSearch] = useState('');
  const team = mockUsers.filter(u => u.role === 'SALARIE' && `${u.prenom} ${u.nom}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader title="Mon équipe" description="Liste et progression de vos salariés">
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Exporter</Button>
      </PageHeader>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {team.map((user, i) => {
            const parcours = mockParcours.find(p => p.salarieId === user.id);
            return (
              <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="p-5 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                <div className="w-11 h-11 rounded-full bg-manager-muted flex items-center justify-center text-sm font-semibold text-manager">
                  {user.prenom[0]}{user.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-muted-foreground">{user.poste?.titre} · {user.poste?.departement}</p>
                </div>
                <div className="w-32">
                  {parcours ? (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{parcours.intitule}</span>
                        <span className="font-medium text-foreground">{parcours.progression}%</span>
                      </div>
                      <ProgressBar value={parcours.progression} colorClass="bg-manager" />
                    </>
                  ) : <span className="text-xs text-muted-foreground">Aucun parcours</span>}
                </div>
                <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerEquipe;
