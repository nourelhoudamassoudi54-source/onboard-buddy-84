import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CandidaturesProvider } from "@/contexts/CandidaturesContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSalaries from "./pages/admin/AdminSalaries";
import AdminPostes from "./pages/admin/AdminPostes";
import AdminParcours from "./pages/admin/AdminParcours";
import AdminSuivi from "./pages/admin/AdminSuivi";
import AdminReporting from "./pages/admin/AdminReporting";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerEquipe from "./pages/manager/ManagerEquipe";
import ManagerTaches from "./pages/manager/ManagerTaches";
import ManagerReporting from "./pages/manager/ManagerReporting";
import SalarieDashboard from "./pages/salarie/SalarieDashboard";
import SalarieParcours from "./pages/salarie/SalarieParcours";
import SalarieTaches from "./pages/salarie/SalarieTaches";
import SalarieDocuments from "./pages/salarie/SalarieDocuments";
import SalarieProfil from "./pages/salarie/SalarieProfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CandidaturesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin RH */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/salaries" element={<AdminSalaries />} />
            <Route path="/admin/postes" element={<AdminPostes />} />
            <Route path="/admin/parcours" element={<AdminParcours />} />
            <Route path="/admin/suivi" element={<AdminSuivi />} />
            <Route path="/admin/reporting" element={<AdminReporting />} />

            {/* Manager */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/equipe" element={<ManagerEquipe />} />
            <Route path="/manager/taches" element={<ManagerTaches />} />
            <Route path="/manager/reporting" element={<ManagerReporting />} />

            {/* Salarié */}
            <Route path="/salarie/dashboard" element={<SalarieDashboard />} />
            <Route path="/salarie/parcours" element={<SalarieParcours />} />
            <Route path="/salarie/taches" element={<SalarieTaches />} />
            <Route path="/salarie/documents" element={<SalarieDocuments />} />
            <Route path="/salarie/profil" element={<SalarieProfil />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CandidaturesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
