import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { db } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Categorie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export default function AdminCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => {
      const { data } = await db.from("categories").select("*").order("nom");
      return (data as Categorie[]) ?? [];
    },
  });

  const create = async () => {
    const parsed = z.object({ nom: z.string().trim().min(2).max(80) }).safeParse({ nom });
    if (!parsed.success) { toast.error("Nom de catégorie invalide"); return; }
    const { error } = await db.from("categories").insert({ nom, description });
    if (error) { toast.error(error.message); return; }
    toast.success("Catégorie créée");
    setNom(""); setDescription(""); setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const remove = async (id: string) => {
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Catégorie supprimée");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  return (
    <AppLayout title="Catégories" description="Gérez les catégories de réclamations"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nouvelle catégorie</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              <Textarea placeholder="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={create}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }>
      <div className="grid gap-3 sm:grid-cols-2">
        {cats.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-muted text-navy"><Tags className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.nom}</p>
                {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {cats.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune catégorie.</p>}
      </div>
    </AppLayout>
  );
}
