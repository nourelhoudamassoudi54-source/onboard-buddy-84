import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db, supabase } from "@/lib/db";
import { Reclamation, Commentaire, PieceJointe, Profile, ReclamationStatut } from "@/lib/types";
import { STATUT_CONFIG, STATUT_ORDER } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { UrgenceBadge } from "@/components/UrgenceBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Loader2, Paperclip, Send, MessageSquare } from "lucide-react";

export default function ReclamationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [rec, setRec] = useState<Reclamation | null>(null);
  const [comments, setComments] = useState<Commentaire[]>([]);
  const [pieces, setPieces] = useState<PieceJointe[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [newStatut, setNewStatut] = useState<ReclamationStatut>("en_cours");
  const [statutComment, setStatutComment] = useState("");
  const [savingStatut, setSavingStatut] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const { data: r } = await db.from("reclamations").select("*").eq("id", id).maybeSingle();
    setRec(r as Reclamation);
    if (r) setNewStatut(r.statut);
    const [{ data: c }, { data: p }] = await Promise.all([
      db.from("commentaires").select("*").eq("reclamation_id", id).order("created_at"),
      db.from("pieces_jointes").select("*").eq("reclamation_id", id).order("created_at"),
    ]);
    setComments((c as Commentaire[]) ?? []);
    setPieces((p as PieceJointe[]) ?? []);
    const ids = new Set<string>();
    if (r) { ids.add(r.client_id); if (r.agent_id) ids.add(r.agent_id); }
    (c as Commentaire[] ?? []).forEach((x) => ids.add(x.auteur_id));
    if (ids.size) {
      const { data: profs } = await db.from("profiles").select("*").in("id", Array.from(ids));
      const map: Record<string, Profile> = {};
      (profs as Profile[] ?? []).forEach((pr) => (map[pr.id] = pr));
      setProfiles(map);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const sendMessage = async () => {
    if (!message.trim() || !user || !id) return;
    setSending(true);
    const { error } = await db.from("commentaires").insert({
      reclamation_id: id, auteur_id: user.id, message: message.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setMessage("");
    load();
  };

  const changeStatut = async () => {
    if (!id || !user) return;
    if (!statutComment.trim()) { toast.error("Un commentaire est obligatoire"); return; }
    setSavingStatut(true);
    const patch: Record<string, unknown> = { statut: newStatut };
    if (newStatut === "cloturee" || newStatut === "resolue") patch.date_cloture = new Date().toISOString();
    const { error } = await db.from("reclamations").update(patch).eq("id", id);
    if (!error) {
      await db.from("commentaires").insert({
        reclamation_id: id, auteur_id: user.id,
        message: `[Changement de statut → ${STATUT_CONFIG[newStatut].label}] ${statutComment.trim()}`,
      });
    }
    setSavingStatut(false);
    if (error) { toast.error(error.message); return; }
    setStatutComment("");
    toast.success("Statut mis à jour");
    load();
  };

  const openFile = async (path: string) => {
    const { data } = await supabase.storage.from("pieces-jointes").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const name = (uid: string) => {
    const p = profiles[uid];
    return p ? `${p.prenom} ${p.nom}` : "Utilisateur";
  };

  const backLink =
    role === "admin" ? "/admin/reclamations" : role === "agent" ? "/agent/dashboard" : "/client/reclamations";
  const canManage = role === "agent" || role === "admin";

  if (loading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }
  if (!rec) {
    return <AppLayout title="Introuvable"><p className="text-muted-foreground">Cette réclamation n'existe pas ou vous n'y avez pas accès.</p></AppLayout>;
  }

  // Build timeline from creation + comments
  const timeline = [
    { id: "creation", date: rec.created_at, label: "Réclamation créée", author: name(rec.client_id) },
    ...comments.map((c) => ({ id: c.id, date: c.created_at, label: c.message, author: name(c.auteur_id) })),
  ];

  return (
    <AppLayout>
      <Link to={backLink} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{rec.titre}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Créée le {format(new Date(rec.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={rec.statut} />
                  <UrgenceBadge urgence={rec.urgence} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-foreground">{rec.description}</p>
              {pieces.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Pièces jointes</p>
                  {pieces.map((pj) => (
                    <button key={pj.id} onClick={() => openFile(pj.url_fichier)}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                      <Paperclip className="h-4 w-4 text-navy" /> {pj.nom_fichier}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messagerie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" /> Échanges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun message pour l'instant.</p>
              )}
              <div className="space-y-3">
                {comments.map((c) => {
                  const mine = c.auteur_id === user?.id;
                  return (
                    <div key={c.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-navy text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {c.message}
                      </div>
                      <span className="mt-1 text-[11px] text-muted-foreground">
                        {name(c.auteur_id)} · {format(new Date(c.created_at), "dd/MM HH:mm")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                <Button onClick={sendMessage} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader><CardTitle className="text-base">Traiter la réclamation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={newStatut} onValueChange={(v) => setNewStatut(v as ReclamationStatut)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUT_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea rows={3} value={statutComment} onChange={(e) => setStatutComment(e.target.value)}
                  placeholder="Commentaire (obligatoire)" />
                <Button className="w-full" onClick={changeStatut} disabled={savingStatut}>
                  {savingStatut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour le statut
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Historique</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-4">
                {timeline.map((t) => (
                  <li key={t.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-navy" />
                    <p className="text-sm text-foreground line-clamp-3">{t.label}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {t.author} · {format(new Date(t.date), "dd/MM/yyyy HH:mm")}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{name(rec.client_id)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Agent</span><span>{rec.agent_id ? name(rec.agent_id) : "Non affecté"}</span></div>
              {rec.date_cloture && (
                <div className="flex justify-between"><span className="text-muted-foreground">Clôturée</span><span>{format(new Date(rec.date_cloture), "dd/MM/yyyy")}</span></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
