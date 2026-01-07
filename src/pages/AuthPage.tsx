import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Sparkles,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
  User,
} from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    name: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const API_URL = "http://localhost:5000/api";

      if (isLogin) {
        // --- LOGIN LOGIC ---
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.identifier,
          password: formData.password,
        });

        const data = response.data;

        // 1. Update Context
        login(data.token, data.user.email, data.user.isOnboarded);

        // 2. 🔥 SAVE DETAILS TO STORAGE (So Dashboard sees "Rahul" not "Anonymous")
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("userCollege", data.user.college || "");
        localStorage.setItem("userRole", data.user.role || "");

        // 3. Redirect based on status
        if (data.user.isOnboarded) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        // --- SIGNUP LOGIC ---
        await axios.post(`${API_URL}/signup`, {
          name: formData.name,
          email: formData.identifier,
          password: formData.password,
        });

        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.response?.data?.message || "Connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (Keep your existing JSX return exactly as it was)
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? "Welcome Back" : "Join GitTogether"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin
              ? "Login to find your perfect team."
              : "Create an account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="bg-background/50 pl-10"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="identifier">Email Address</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                id="identifier"
                type="email"
                placeholder="name@example.com"
                className="bg-background/50 pl-10"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 pl-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Connecting..." : isLogin ? "Login" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
