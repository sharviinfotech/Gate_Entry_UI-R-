import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InwardPOReference from "./pages/inward/InwardPOReference";
import InwardSubcontracting from "./pages/inward/InwardSubcontracting";
import InwardWithoutReference from "./pages/inward/InwardWithoutReference";
import OutwardBillingReference from "./pages/outward/OutwardBillingReference";
import OutwardNonReturnable from "./pages/outward/OutwardNonReturnable";
import OutwardReturnable from "./pages/outward/OutwardReturnable";
import ChangeEntry from "./pages/ChangeEntry";
import DisplayEntry from "./pages/DisplayEntry";
import VehicleExit from "./pages/VehicleExit";
import CancelEntry from "./pages/CancelEntry";
import PrintEntry from "./pages/PrintEntry";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/inward/po-reference" element={<InwardPOReference />} />
              <Route path="/inward/subcontracting" element={<InwardSubcontracting />} />
              <Route path="/inward/without-reference" element={<InwardWithoutReference />} />
              <Route path="/outward/billing-reference" element={<OutwardBillingReference />} />
              <Route path="/outward/non-returnable" element={<OutwardNonReturnable />} />
              <Route path="/outward/returnable" element={<OutwardReturnable />} />
              <Route path="/change" element={<ChangeEntry />} />
              <Route path="/display" element={<DisplayEntry />} />
              <Route path="/vehicle-exit" element={<VehicleExit />} />
              <Route path="/cancel" element={<CancelEntry />} />
              <Route path="/print" element={<PrintEntry />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<HelpSupport />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
