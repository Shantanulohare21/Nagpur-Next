import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SimulationPage from "@/pages/SimulationPage";
import ImplantLibraryPage from "@/pages/ImplantLibraryPage";
import DashboardPage from "@/pages/DashboardPage";
import SurgeonTrainingPage from "@/pages/SurgeonTrainingPage";
import AICopilotPage from "@/pages/AICopilotPage";
import ARVRPage from "@/pages/ARVRPage";
import ReportsPage from "@/pages/ReportsPage";
import ResearchPage from "@/pages/ResearchPage";
import PatientIntakePage from "@/pages/PatientIntakePage";
import ScanAnalysisPage from "@/pages/ScanAnalysisPage";
import { PatientProvider } from "@/contexts/PatientContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/intake" component={PatientIntakePage} />
      <Route path="/scan-analysis" component={ScanAnalysisPage} />
      <Route path="/simulation" component={SimulationPage} />
      <Route path="/implants" component={ImplantLibraryPage} />
      <Route path="/training" component={SurgeonTrainingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/copilot" component={AICopilotPage} />
      <Route path="/arvr" component={ARVRPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/research" component={ResearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PatientProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </PatientProvider>
    </QueryClientProvider>
  );
}

export default App;
