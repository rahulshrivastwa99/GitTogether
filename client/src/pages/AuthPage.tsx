import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import API_BASE_URL from "@/lib/api";

import axios from "axios";
import {
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";

export default function AuthPage() {
  // 🔥 STRATEGY: Default to Login.
  const [isLogin, setIsLogin] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    name: "",
  });

  // --- GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google User:", user); 

      const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
      
      const res = await axios.post(`${cleanBaseUrl}/api/google-login`, {
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL
      });

      login(res.data.token, res.data.user);
      toast.success("System Access Granted. Welcome! 🚀");
      
      if (res.data.user.isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }

    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Auth Protocol Cancelled.");
    }
  };

  // --- EMAIL/PASSWORD HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
    const API_URL = `${cleanBaseUrl}/api`;

    console.log("🚀 Attempting to connect to:", API_URL);

    try {
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

        // Save basics to local storage
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("userCollege", data.user.college || "");
        localStorage.setItem("userRole", data.user.role || "");
        if (data.user.avatarGradient) {
          localStorage.setItem("userAvatar", data.user.avatarGradient);
        }

        toast.success("Identity Verified. Welcome back! 👋");

        if (data.user.isOnboarded) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        // --- MANUAL SIGNUP BLOCKED ---
        toast.info("Manual signup is paused. 🛑 Please use Google Login!");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      
      // 🔥 GENUINE COOL ERROR HANDLING 🔥
      let displayMessage = "Connection interrupted. Retry handshake.";
      
      // 1. Check for 404 (User Not Found)
      if (err.response?.status === 404) {
        displayMessage = "User object not found! 🌟 Use Google to initialize.";
      } 
      // 2. Check for 400 (Invalid Credentials)
      else if (err.response?.status === 400) {
        displayMessage = "Access Denied: Invalid key/password. 🔑";
      }
      // 3. Fallback to server message if available
      else if (err.response?.data?.message) {
        displayMessage = err.response.data.message;
      }

      setError(displayMessage);
      toast.error(displayMessage);
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

      {/* 3. Floating Particles */}
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
            className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] backdrop-blur-sm"
          >
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23222222'/%3E%3Ccircle cx='35' cy='40' r='12' fill='%23FF6B6B'/%3E%3Crect x='28' y='55' width='14' height='28' rx='7' fill='%23FF6B6B'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%2342C2FF'/%3E%3Crect x='58' y='55' width='14' height='28' rx='7' fill='%2342C2FF'/%3E%3Cpath d='M35 65 Q50 50 65 65' stroke='%2300FF88' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='50' cy='52' r='3' fill='%2300FF88'/%3E%3C/svg%3E"
              alt="GitTogether Logo"
              className="w-7 h-7 rounded-lg drop-shadow-xl"
            />
          </motion.div>

          <div className="relative h-9 overflow-hidden mb-2">
            <AnimatePresence mode="wait">
              <motion.h1
                key="login"
                initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 absolute w-full tracking-tight"
              >
                Ready to Commit?
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            layout
            className="text-muted-foreground text-xs max-w-[90%] mx-auto"
          >
            Initialize session to merge with the best teams.
          </motion.p>
        </div>

        {/* --- GOOGLE BUTTON --- */}
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#0c0c0c] px-2 text-muted-foreground">Or access via terminal</span>
            </div>
          </div>
        </div>

        {/* --- MANUAL LOGIN FORM --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="identifier"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1"
            >
              Dev ID / Email
            </Label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="identifier"
                type="email"
                placeholder="dev@git-together.com"
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
              Access Key
            </Label>
            <div className="relative group">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
              <span>
                {isLoading ? "Connecting..." : ">> Authenticate"}
              </span>
            </div>
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs">
          <p className="text-muted-foreground/60 italic">
            Uninitialized? Execute{" "}
            <span 
              onClick={handleGoogleLogin} 
              className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
            >
              Google Auth
            </span>{" "}
            for verified instance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}