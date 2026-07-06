import { AppLayout } from "@/components/AppLayout";
import { db } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile, UserRoleRow, AppRole } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminUtilisateurs() {
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profs }, { data: roles }] = await Promise.all([
        db.from("profiles").select("*").order("created_at", { ascending: false }),
        db.from("user_roles").select("*"),
      ]);
      const roleMap: Record<string, AppRole> = {};
      ((roles as UserRoleRow[]) ?? []).forEach((r) => (roleMap[r.user_id] = r.role));
      return ((profs as Profile[]) ?? []).map((p) => ({ ...p, role: roleMap[p.id] ?? ("client" as AppRole) }));
    },
  });

  const toggleActif = async (id: string, actif: boolean) => {
    const { error } = await db.from("profiles").update({ actif }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(actif ? "Compte activé" : "Compte désactivé");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const changeRole = async (userId: string, role: AppRole) => {
    await db.from("user_roles").delete().eq("user_id", userId);
    const { error } = await db.from("user_roles").insert({ user_id: userId, role });
    if (error) { toast.error(error.message); return; }
    toast.success("Rôle mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <AppLayout title="Utilisateurs" description="Gérez les comptes clients, agents et administrateurs">
      <div className="grid gap-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-semibold text-primary-foreground">
                {(u.prenom[0] ?? "") + (u.nom[0] ?? "")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.prenom} {u.nom}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as AppRole)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_CONFIG) as AppRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{u.actif ? "Actif" : "Inactif"}</span>
                <Switch checked={u.actif} onCheckedChange={(v) => toggleActif(u.id, v)} />
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucun utilisateur.</p>}
      </div>
    </AppLayout>
  );
}
