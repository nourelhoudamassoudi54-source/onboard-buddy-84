import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/types";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Landmark, Loader2, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Au moins 6 caractères").max(72),
});

const signupSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional(),
  password: z.string().min(6, "Au moins 6 caractères").max(72),
  role: z.enum(["client", "agent", "admin"]),
});

export default function Auth() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // login state
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");

  // signup state
  const [sPrenom, setSPrenom] = useState("");
  const [sNom, setSNom] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sTel, setSTel] = useState("");
  const [sPass, setSPass] = useState("");
  const [sRole, setSRole] = useState<AppRole>("client");

  const quickLogin = async (email: string) => {
    setLEmail(email);
    setLPass("Test1234!");
    setLoading(true);
    const { error } = await login(email, "Test1234!");
    setLoading(false);
    if (error) {
      toast.error("Email ou mot de passe incorrect");
      return;
    }
    toast.success("Connexion réussie");
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: lEmail.trim(), password: lPass.trim() });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await login(parsed.data.email, parsed.data.password);

    setLoading(false);
    if (error) {
      toast.error(error.includes("Invalid") ? "Email ou mot de passe incorrect" : error);
      return;
    }
    toast.success("Connexion réussie");
    navigate("/");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({
      prenom: sPrenom,
      nom: sNom,
      email: sEmail,
      telephone: sTel,
      password: sPass,
      role: sRole,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signup({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      password: parsed.data.password,
      role: parsed.data.role,
    });
    setLoading(false);
    if (error) {
      toast.error(error.includes("already") ? "Cet email est déjà utilisé" : error);
      return;
    }
    toast.success("Compte créé ! Vous pouvez vous connecter.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy-deep p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold">
            <Landmark className="h-6 w-6 text-navy-deep" />
          </div>
          <span className="text-2xl font-bold">ReclamBank</span>
        </div>
        <div className="space-y-5">
          <h1 className="text-4xl font-bold leading-tight">
            Vos réclamations bancaires,
            <br />
            traitées en toute confiance.
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Déposez, suivez et échangez sur vos réclamations en toute
            transparence. Un service rapide, sécurisé et à votre écoute.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Données protégées et confidentielles
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} ReclamBank. Tous droits réservés.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy">
              <Landmark className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-navy">ReclamBank</span>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="l-email">Email</Label>
                  <Input
                    id="l-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="l-pass">Mot de passe</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-navy hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Input
                    id="l-pass"
                    type="password"
                    placeholder="••••••••"
                    value={lPass}
                    onChange={(e) => setLPass(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="s-prenom">Prénom</Label>
                    <Input id="s-prenom" value={sPrenom} onChange={(e) => setSPrenom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-nom">Nom</Label>
                    <Input id="s-nom" value={sNom} onChange={(e) => setSNom(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-tel">Téléphone (optionnel)</Label>
                  <Input id="s-tel" value={sTel} onChange={(e) => setSTel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-pass">Mot de passe</Label>
                  <Input id="s-pass" type="password" value={sPass} onChange={(e) => setSPass(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type de compte</Label>
                  <Select value={sRole} onValueChange={(v) => setSRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
