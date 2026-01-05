import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ModeCard } from "@/components/ModeCard";
import { TechTag } from "@/components/TechTag";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Import Auth Logic
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const techOptions = [
  "React",
  "Python",
  "TypeScript",
  "Node.js",
  "Flutter",
  "Swift",
  "Rust",
  "Go",
  "Java",
  "C++",
  "Machine Learning",
  "Web3",
  "DevOps",
  "UI/UX",
  "Mobile",
];

const modes = [
  {
    emoji: "🔥",
    title: "Beast Mode",
    description: "Here to win. No sleep.",
    variant: "beast" as const,
  },
  {
    emoji: "☕",
    title: "Chill Mode",
    description: "Here to learn & vibe.",
    variant: "chill" as const,
  },
  {
    emoji: "🎓",
    title: "Newbie Mode",
    description: "First timer. Help me.",
    variant: "newbie" as const,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context

  const [step, setStep] = useState(1); // Now Step 1 is Auth
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- AUTH STATE ---
  const [isLogin, setIsLogin] = useState(false); // Default to Signup for onboarding
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleTechToggle = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  // --- VALIDATION LOGIC ---
  const canProceed = () => {
    if (step === 1) return false; // Handled by the Form Submit, not the "Continue" button
    if (step === 2) return true; // Resume is optional/skippable
    if (step === 3) return selectedMode !== null;
    if (step === 4) return selectedTech.length > 0;
    return false;
  };

  // --- AUTH SUBMIT HANDLER (Step 1) ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    // Simulate Network Call
    setTimeout(() => {
      // 1. Validation
      if (!authData.email.endsWith(".edu")) {
        setAuthError("Please use a valid .edu college email.");
        setAuthLoading(false);
        return;
      }
      if (authData.password.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        setAuthLoading(false);
        return;
      }

      // 2. Success
      login(authData.email); // Set global auth state
      setAuthLoading(false);
      setStep(2); // Move to Resume Step
    }, 1500);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Progress bar (Now 4 Steps) */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                  s === step
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                    : s < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-secondary text-muted-foreground"
                )}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          {/* Progress Line */}
          <div className="h-1 bg-secondary rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* === STEP 1: AUTHENTICATION (Login/Signup) === */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground">
                  Use your university email to verify your student status.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Name (Signup Only) */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className="pl-9"
                          value={authData.name}
                          onChange={(e) =>
                            setAuthData({ ...authData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">College Email (.edu)</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@university.edu"
                        className="pl-9"
                        value={authData.email}
                        onChange={(e) =>
                          setAuthData({ ...authData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={authData.password}
                        onChange={(e) =>
                          setAuthData({ ...authData, password: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {authError && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {authError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isLogin ? (
                      "Login"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthError("");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* === STEP 2: RESUME UPLOAD === */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Upload Your Resume
                </h1>
                <p className="text-muted-foreground">
                  We'll use AI to create your perfect hacker profile
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-6 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drag & drop your resume
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse (PDF, DOCX)
                </p>
                <button className="text-sm text-primary hover:underline">
                  Browse files
                </button>
              </motion.div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have a resume?{" "}
                <button
                  onClick={() => setStep(3)}
                  className="text-primary hover:underline"
                >
                  Skip for now
                </button>
              </p>
            </motion.div>
          )}

          {/* === STEP 3: CHOOSE MODE === */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Choose Your Mode
                </h1>
                <p className="text-muted-foreground">
                  What's your hackathon energy?
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {modes.map((mode) => (
                  <ModeCard
                    key={mode.variant}
                    emoji={mode.emoji}
                    title={mode.title}
                    description={mode.description}
                    variant={mode.variant}
                    selected={selectedMode === mode.variant}
                    onClick={() => setSelectedMode(mode.variant)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* === STEP 4: TECH STACK === */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Your Tech Stack
                </h1>
                <p className="text-muted-foreground">
                  Select your skills and interests
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {techOptions.map((tech) => (
                  <TechTag
                    key={tech}
                    label={tech}
                    selected={selectedTech.includes(tech)}
                    onClick={() => handleTechToggle(tech)}
                  />
                ))}
              </div>

              {selectedTech.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-muted-foreground mt-6"
                >
                  {selectedTech.length} skill
                  {selectedTech.length !== 1 ? "s" : ""} selected
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- NAVIGATION BUTTONS --- */}
        {/* Only show "Back" and "Continue" for steps AFTER Auth */}
        {step > 1 && (
          <div className="max-w-xl mx-auto mt-12 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-foreground hover:bg-muted transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: canProceed() ? 1.05 : 1 }}
              whileTap={{ scale: canProceed() ? 0.95 : 1 }}
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                canProceed()
                  ? "gradient-primary text-primary-foreground glow-primary"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {step === 4 ? "Start Matching" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
