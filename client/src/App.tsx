import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import ForgotPasswordPage from "@/pages/forgot-password";
import VerifyPage from "@/pages/verify";
import DashboardPage from "@/pages/dashboard";
import RegisterPage from "@/pages/register";
import CheckingPage from "@/pages/checking";
import SavingsPage from "@/pages/savings";
import CreditCardsPage from "@/pages/credit-cards";
import HomeLoansPage from "@/pages/home-loans";
import AutoPage from "@/pages/auto";
import InvestingPage from "@/pages/investing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/verify" component={VerifyPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/checking" component={CheckingPage} />
      <Route path="/savings" component={SavingsPage} />
      <Route path="/credit-cards" component={CreditCardsPage} />
      <Route path="/home-loans" component={HomeLoansPage} />
      <Route path="/auto" component={AutoPage} />
      <Route path="/investing" component={InvestingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
