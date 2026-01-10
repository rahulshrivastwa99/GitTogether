import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API_BASE_URL from "@/lib/api";

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
      const API_URL = `${API_BASE_URL}/api`;

      if (isLogin) {
        // --- LOGIN LOGIC ---
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.identifier,
          password: formData.password,
        });

        const data = response.data;

        if (!data?.user || !data?.token) {
          throw new Error(data?.message || "Invalid login credentials");
        }

        login(data.token, data.user.email, data.user.isOnboarded);

        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("userCollege", data.user.college || "");
        localStorage.setItem("userRole", data.user.role || "");

        if (data.user.avatarGradient) {
          localStorage.setItem("userAvatar", data.user.avatarGradient);
        }

        toast.success("Welcome back! 🚀");

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

        toast.success("Account created successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Connection failed.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden text-foreground selection:bg-primary/30">
      {/* =========================================
          BACKGROUND DESIGN START
      ========================================= */}

      {/* 1. Animated Moving Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px"],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />
      </motion.div>

      {/* 2. Ambient Color Glows (Blobs) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 100, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
      />

      {/* 3. Floating Particles / Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 100 }}
            animate={{
              opacity: [0, 1, 0],
              y: -100,
              x: Math.random() * 50 - 25,
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* =========================================
          CARD CONTENT
      ========================================= */}

      <motion.div
        layout
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        // CHANGED: Reduced max-w-md to max-w-[400px] and p-8 to p-6 for a tighter look
        className="w-full max-w-[400px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_0_50px_-10px_rgba(var(--primary),0.15)] relative z-10 group"
      >
        {/* Subtle Gradient Border Effect on Hover */}
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/5 group-hover:ring-primary/20 transition-all duration-500 pointer-events-none" />

        <div className="text-center mb-6">
          <motion.div
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -8, 0] }}
            transition={{
              scale: { delay: 0.2, type: "spring" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            // CHANGED: Reduced logo container size from w-16 h-16 to w-12 h-12
            className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] backdrop-blur-sm"
          >
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23222222'/%3E%3Ccircle cx='35' cy='40' r='12' fill='%23FF6B6B'/%3E%3Crect x='28' y='55' width='14' height='28' rx='7' fill='%23FF6B6B'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%2342C2FF'/%3E%3Crect x='58' y='55' width='14' height='28' rx='7' fill='%2342C2FF'/%3E%3Cpath d='M35 65 Q50 50 65 65' stroke='%2300FF88' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='50' cy='52' r='3' fill='%2300FF88'/%3E%3C/svg%3E"
              alt="GitTogether Logo"
              // CHANGED: Reduced image size from w-10 to w-7
              className="w-7 h-7 rounded-lg drop-shadow-xl"
            />
          </motion.div>

          <div className="relative h-9 overflow-hidden mb-2">
            <AnimatePresence mode="wait">
              <motion.h1
                key={isLogin ? "login" : "signup"}
                initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                // CHANGED: Reduced font from text-3xl to text-2xl
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 absolute w-full tracking-tight"
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            layout
            className="text-muted-foreground text-xs max-w-[90%] mx-auto"
          >
            {isLogin
              ? "Login to find your perfect team."
              : "Join the community today."}
          </motion.p>
        </div>

        {/* CHANGED: Reduced gap from space-y-5 to space-y-4 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* {!isLogin && (
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
          )} */}

          <div className="space-y-1.5">
            <Label
              htmlFor="identifier"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1"
            >
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="identifier"
                type="email"
                placeholder="name@example.com"
                // CHANGED: Reduced height from h-11 to h-10
                className="bg-white/5 border-white/10 pl-9 h-10 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl placeholder:text-muted-foreground/40 text-sm"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1"
            >
              Password
            </Label>
            <div className="relative group">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                // CHANGED: Reduced height from h-11 to h-10
                className="bg-white/5 border-white/10 pl-9 h-10 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl placeholder:text-muted-foreground/40 text-sm"
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 backdrop-blur-sm"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            // CHANGED: Reduced height from h-11 to h-10, mt-4 to mt-3
            className="w-full h-10 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] font-bold rounded-xl mt-3 relative overflow-hidden group/btn text-sm"
            size="lg"
            disabled={isLoading}
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />

            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
              )}
              <span key={isLogin ? "login-btn" : "signup-btn"}>
                {isLoading
                  ? "Connecting..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </span>
            </div>
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-white font-semibold hover:text-primary transition-colors ml-1 hover:underline underline-offset-4"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
