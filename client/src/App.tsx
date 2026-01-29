import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import HealthWorkerLogin from "@/pages/health_worker_login";
import HealthWorkerConsultation from "@/pages/health_worker_consultation";
import TeleconsultPage from "@/pages/TeleconsultPage";
import TestChat from "@/pages/TestChat";
import PharmacyFinder from "@/pages/pharmacy-finder";
import AIHealthAssistant from "@/pages/AIHealthAssistant";
import EyeAbnormalDetector from "@/pages/EyeAbnormalDetector";
import AIPrescriptionPage from "@/pages/AIPrescriptionPage";
import BuyMedicine from "@/pages/buy-medicine";
import PharmacyInventory from "@/pages/pharmacy-inventory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={HealthWorkerLogin} />
      <Route path="/consultations" component={HealthWorkerConsultation} />
      <Route path="/teleconsult" component={TeleconsultPage} />
      <Route path="/records" component={EyeAbnormalDetector} />
      <Route path="/prescriptions" component={AIPrescriptionPage} />
      <Route path="/pharmacy" component={PharmacyFinder} />
      <Route path="/buy-medicine" component={BuyMedicine} />
      <Route path="/pharmacy-inventory" component={PharmacyInventory} />
      <Route path="/ai-assistant" component={AIHealthAssistant} />
      <Route path="/eye-analysis" component={EyeAbnormalDetector} />
      <Route path="/test-chat" component={TestChat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
