import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_CONFIG } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function RoleRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role) return <Navigate to={ROLE_CONFIG[role].home} replace />;
  return <Navigate to="/auth" replace />;
}
