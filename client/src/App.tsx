import React from "react";
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

function AppRouter() {
  const [currentPath, setCurrentPath] = React.useState(() => {
    return window.location.hash.replace('#', '') || '/';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#', '') || '/');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage />;
      case '/login':
        return <HealthWorkerLogin />;
      case '/consultations':
        return <HealthWorkerConsultation />;
      case '/teleconsult':
        return <TeleconsultPage />;
      case '/records':
        return <EyeAbnormalDetector />;
      case '/prescriptions':
        return <AIPrescriptionPage />;
      case '/pharmacy':
        return <PharmacyFinder />;
      case '/buy-medicine':
        return <BuyMedicine />;
      case '/pharmacy-inventory':
        return <PharmacyInventory />;
      case '/ai-assistant':
        return <AIHealthAssistant />;
      case '/eye-analysis':
        return <EyeAbnormalDetector />;
      case '/test-chat':
        return <TestChat />;
      default:
        return <NotFound />;
    }
  };

  return renderPage();
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
