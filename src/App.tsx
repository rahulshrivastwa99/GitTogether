import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage"; // ✅ Restore this import
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import IdeaSpark from "./pages/IdeaSpark";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HackathonPage from "./pages/HackathonPage";
import CalendarPage from "./pages/CalendarPage";
import TeamAnalysis from "./pages/TeamAnalysis";
import TeamAgreement from "./pages/TeamAgreement";

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

const queryClient = new QueryClient();

// ProtectedRoute: Only allows access if user has a Token
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};
// console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* ✅ Step 1: Login / Signup */}
            <Route path="/auth" element={<AuthPage />} />

            {/* ✅ Step 2: Profile Setup (Must have token to access) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* ✅ Step 3: Main Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Other Protected Routes */}
            <Route
              path="/dashboard/team-analysis"
              element={
                <ProtectedRoute>
                  <TeamAnalysis />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/contract"
              element={
                <ProtectedRoute>
                  <TeamAgreement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/hackathons"
              element={
                <ProtectedRoute>
                  <HackathonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ideas"
              element={
                <ProtectedRoute>
                  <IdeaSpark />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
