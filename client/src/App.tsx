import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AccessProtectedRoute } from "@/components/access-protected-route";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import BeaverPatch from "@/pages/beaverpatch";
import BeaverPaws from "@/pages/beaverpaws";
import BeaverCRM from "@/pages/beavercrm";
import BeaverDoc from "@/pages/beaverdoc";
import BeaverPay from "@/pages/beaverpay";
import BeaverRisk from "@/pages/beaverisk";
import BeaverAudit from "@/pages/beaveraudit";
import BeaverDMV from "@/pages/beaverdmv";

import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
        <div className="text-beaver-orange text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
        <div className="text-beaver-orange text-xl">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverPatch">
        <AccessProtectedRoute pageName="beaverpatch">
          <BeaverPatch />
        </AccessProtectedRoute>
      </Route>
      <Route path="/BeaverPaws">
        <ProtectedRoute>
          <BeaverPaws />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverCRM">
        <ProtectedRoute>
          <BeaverCRM />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverDoc">
        <ProtectedRoute>
          <BeaverDoc />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverPay">
        <ProtectedRoute>
          <BeaverPay />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverRisk">
        <ProtectedRoute>
          <BeaverRisk />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverAudit">
        <ProtectedRoute>
          <BeaverAudit />
        </ProtectedRoute>
      </Route>
      <Route path="/BeaverDMV">
        <ProtectedRoute>
          <BeaverDMV />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
