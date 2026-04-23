import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      const user = email.includes('sophie') ? '/admin/dashboard'
        : email.includes('pierre') || email.includes('lea') ? '/manager/dashboard'
        : '/salarie/dashboard';
      navigate(user);
    } else {
      toast({ title: 'Erreur', description: 'Email ou mot de passe incorrect', variant: 'destructive' });
    }
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    const success = login(email, 'demo');
    if (success) {
      const path = email.includes('sophie') ? '/admin/dashboard'
        : email.includes('pierre') ? '/manager/dashboard'
        : '/salarie/dashboard';
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-manager/50" />
        <div className="relative z-10 text-primary-foreground max-w-md">
          <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-8">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">OnboardPro</h1>
          <p className="text-lg opacity-90 mb-8">
            Plateforme de gestion d'onboarding RH. Simplifiez l'intégration de vos nouveaux collaborateurs.
          </p>
          <div className="space-y-3">
            {['Parcours personnalisés', 'Suivi en temps réel', 'KPI & Reporting'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">OnboardPro</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Connexion</h2>
          <p className="text-sm text-muted-foreground mb-8">Accédez à votre espace de gestion</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Se connecter <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
          </div>

          <Link to="/signup" className="block">
            <Button type="button" variant="outline" className="w-full border-salarie/30 text-salarie hover:bg-salarie/10 hover:text-salarie">
              Créer un compte salarié
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Complétez votre dossier, l'Admin RH validera et vous enverra vos identifiants.
          </p>

          <div className="mt-8">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Accès rapide (démo)</p>
            <div className="space-y-2">
              {[
                { label: 'Admin RH', email: 'sophie.martin@company.com', cls: 'bg-admin/10 text-admin hover:bg-admin/20 border-admin/20' },
                { label: 'Manager', email: 'pierre.dubois@company.com', cls: 'bg-manager/10 text-manager hover:bg-manager/20 border-manager/20' },
                { label: 'Salarié', email: 'marie.leroy@company.com', cls: 'bg-salarie/10 text-salarie hover:bg-salarie/20 border-salarie/20' },
              ].map(r => (
                <button
                  key={r.email}
                  onClick={() => quickLogin(r.email)}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors text-left ${r.cls}`}
                >
                  Connexion en tant que <span className="font-semibold">{r.label}</span>
                  <span className="block text-xs opacity-70 mt-0.5">{r.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
