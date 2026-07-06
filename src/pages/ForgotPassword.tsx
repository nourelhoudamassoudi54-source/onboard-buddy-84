import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Landmark, Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email.trim());
    if (!parsed.success) {
      toast.error("Email invalide");
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy">
            <Landmark className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-navy">ReclamBank</span>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-resolue-bg">
              <MailCheck className="h-6 w-6 text-status-resolue" />
            </div>
            <h1 className="text-xl font-bold">Email envoyé</h1>
            <p className="text-sm text-muted-foreground">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un
              lien de réinitialisation.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Retour à la connexion</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-bold">Mot de passe oublié</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer le lien
              </Button>
            </form>
            <Link
              to="/auth"
              className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
