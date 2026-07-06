import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRedirect } from "@/components/RoleRedirect";

import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profil from "./pages/Profil";
import ReclamationDetail from "./pages/ReclamationDetail";

import ClientDashboard from "./pages/client/ClientDashboard";
import NouvelleReclamation from "./pages/client/NouvelleReclamation";
import ClientReclamations from "./pages/client/ClientReclamations";

import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentCalendrier from "./pages/agent/AgentCalendrier";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReclamations from "./pages/admin/AdminReclamations";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminCategories from "./pages/admin/AdminCategories";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Shared authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profil" element={<Profil />} />
              <Route path="/reclamations/:id" element={<ReclamationDetail />} />
              <Route path="/client/reclamations/:id" element={<ReclamationDetail />} />
              <Route path="/agent/reclamations/:id" element={<ReclamationDetail />} />
              <Route path="/admin/reclamations/:id" element={<ReclamationDetail />} />
            </Route>

            {/* Client */}
            <Route element={<ProtectedRoute roles={["client"]} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/nouvelle" element={<NouvelleReclamation />} />
              <Route path="/client/reclamations" element={<ClientReclamations />} />
            </Route>

            {/* Agent */}
            <Route element={<ProtectedRoute roles={["agent"]} />}>
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/calendrier" element={<AgentCalendrier />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reclamations" element={<AdminReclamations />} />
              <Route path="/admin/utilisateurs" element={<AdminUtilisateurs />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
