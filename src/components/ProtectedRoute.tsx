import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { Loader2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function ProtectedRoute({ roles }: { roles?: AppRole[] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  if (roles && role && !roles.includes(role)) {
    return <Navigate to={ROLE_CONFIG[role].home} replace />;
  }

  return <Outlet />;
}
