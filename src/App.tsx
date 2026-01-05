import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext"; // Import Auth Context

// Pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage"; // Import the new Auth Page
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import EquityCalculator from "./pages/EquityCalculator";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- PROTECTED ROUTE WRAPPER ---
// This component checks if the user is logged in.
// If yes, it shows the page. If no, it redirects to the Login page.
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 1. Wrap the entire app in AuthProvider so we can check login status anywhere */}
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} /> {/* New Login Page */}
            <Route path="/onboarding" element={<Onboarding />} />
            {/* --- PROTECTED ROUTES (Require Login) --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/calculator"
              element={
                <ProtectedRoute>
                  <EquityCalculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* --- CATCH ALL --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
