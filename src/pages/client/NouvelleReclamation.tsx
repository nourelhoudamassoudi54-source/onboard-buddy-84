import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db, supabase } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Categorie, UrgenceNiveau } from "@/lib/types";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Paperclip, Upload } from "lucide-react";

export default function NouvelleReclamation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [urgence, setUrgence] = useState<UrgenceNiveau>("moyen");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await db.from("categories").select("*").order("nom");
      return (data as Categorie[]) ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      titre: z.string().trim().min(3, "Titre trop court").max(150),
      description: z.string().trim().min(10, "Description trop courte").max(3000),
      categorieId: z.string().uuid("Choisissez une catégorie"),
    });
    const parsed = schema.safeParse({ titre, description, categorieId });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!user) return;
    setLoading(true);
    const { data: rec, error } = await db
      .from("reclamations")
      .insert({
        client_id: user.id,
        categorie_id: categorieId,
        titre,
        description,
        urgence,
      })
      .select()
      .single();
    if (error || !rec) {
      setLoading(false);
      toast.error(error?.message ?? "Erreur");
      return;
    }
    if (file) {
      const path = `${user.id}/${rec.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("pieces-jointes")
        .upload(path, file);
      if (upErr) {
        toast.error("Réclamation créée, mais échec du téléversement du fichier");
      } else {
        await db.from("pieces_jointes").insert({
          reclamation_id: rec.id,
          url_fichier: path,
          nom_fichier: file.name,
        });
      }
    }
    setLoading(false);
    toast.success("Réclamation déposée");
    navigate(`/reclamations/${rec.id}`);
  };

  return (
    <AppLayout
      title="Nouvelle réclamation"
      description="Décrivez votre problème, notre équipe le traitera rapidement"
    >
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categorieId} onValueChange={setCategorieId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex : Prélèvement non reconnu sur mon compte"
              />
            </div>
            <div className="space-y-2">
              <Label>Description détaillée</Label>
              <Textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez la situation, les dates et montants concernés..."
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau d'urgence</Label>
              <Select value={urgence} onValueChange={(v) => setUrgence(v as UrgenceNiveau)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="eleve">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pièce jointe (optionnel)</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-muted/50">
                <Upload className="h-5 w-5" />
                {file ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <Paperclip className="h-4 w-4" /> {file.name}
                  </span>
                ) : (
                  "Cliquez pour joindre un fichier ou une image"
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Déposer la réclamation
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
