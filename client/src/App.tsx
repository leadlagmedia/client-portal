import { useState, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AdminPage from "@/pages/admin";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      {isAdmin && <Route path="/admin" component={AdminPage} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <Router hook={useHashLocation}>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center h-12 px-4 border-b border-border/40 bg-background/80 backdrop-blur-sm shrink-0">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
            <main className="flex-1 overflow-hidden">
              <AppRoutes />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Router>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Track hash reactively — must be before any early returns
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (hash.startsWith("#/forgot-password")) {
      return (
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route>{() => <LoginPage />}</Route>
          </Switch>
        </Router>
      );
    }
    if (hash.startsWith("#/reset-password")) {
      return (
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/reset-password" component={ResetPasswordPage} />
            <Route>{() => <LoginPage />}</Route>
          </Switch>
        </Router>
      );
    }
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
