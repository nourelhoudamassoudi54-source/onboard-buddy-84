import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Profil() {
  const { profile, refreshProfile } = useAuth();
  const [prenom, setPrenom] = useState(profile?.prenom ?? "");
  const [nom, setNom] = useState(profile?.nom ?? "");
  const [telephone, setTelephone] = useState(profile?.telephone ?? "");
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      prenom: z.string().trim().min(1).max(80),
      nom: z.string().trim().min(1).max(80),
      telephone: z.string().trim().max(30),
    });
    const parsed = schema.safeParse({ prenom, nom, telephone });
    if (!parsed.success) {
      toast.error("Vérifiez les champs saisis");
      return;
    }
    if (!profile) return;
    setLoading(true);
    const { error } = await db
      .from("profiles")
      .update({ prenom, nom, telephone })
      .eq("id", profile.id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profil mis à jour");
  };

  return (
    <AppLayout title="Mon profil" description="Gérez vos informations personnelles">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
