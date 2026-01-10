import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- IMPORTS ---
import { Navbar } from "@/components/Navbar";
import { ModeCard } from "@/components/ModeCard";
import { TechTag } from "@/components/TechTag";
import { cn } from "@/lib/utils";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- CONFIGURATION ---
const BACKEND_URL = `${API_BASE_URL}`;

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
    description: "Here to win.",
    variant: "beast" as const,
  },
  {
    emoji: "☕",
    title: "Chill Mode",
    description: "Here to vibe.",
    variant: "chill" as const,
  },
  {
    emoji: "🎓",
    title: "Newbie Mode",
    description: "First timer.",
    variant: "newbie" as const,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { token, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- PROFILE DATA STATE ---
  const [profileData, setProfileData] = useState({
    name: "",
    college: "",
    bio: "",
    role: "Frontend",
  });

  const handleTechToggle = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const canProceed = () => {
    if (step === 1)
      return profileData.name.length > 0 && profileData.college.length > 0;
    if (step === 2) return true;
    if (step === 3) return selectedMode !== null;
    if (step === 4) return selectedTech.length > 0;
    return false;
  };

  // --- FINAL SUBMIT ---
  const handleProfileSubmit = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error("User not logged in. Please refresh.");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          college: profileData.college,
          bio: profileData.bio,
          role: profileData.role,
          mode: selectedMode || "Chill",
          skills: selectedTech,
          github: "",
        }),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      completeOnboarding();

      toast.success("Profile setup complete! Welcome aboard 🚀");

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleProfileSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden selection:bg-primary/30 font-sans flex flex-col">
      {/* =========================================
          BACKGROUND DESIGN START
      ========================================= */}

      {/* 1. Animated Moving Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 z-0 pointer-events-none"
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* 3. Floating Particles / Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
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
          CONTENT START
      ========================================= */}

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-8">
          {/* Main Container - SIZED PROPERLY (max-w-2xl is the sweet spot) */}
          <div className="w-full max-w-2xl">
            {/* Progress Bar - Compact */}
            <div className="max-w-md mx-auto mb-10 relative">
              <div className="flex items-center justify-between relative z-10">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 text-sm backdrop-blur-md",
                      s === step
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] scale-110"
                        : s < step
                        ? "border-primary/50 bg-primary/20 text-primary"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    )}
                  >
                    {s < step ? <Check className="w-5 h-5" /> : s}
                  </div>
                ))}
              </div>

              {/* Connecting Line */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 rounded-full -z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step - 1) / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Dynamic Content Area - Standardized Size */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Decorative Gradient Top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="min-h-[400px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {/* === STEP 1: BASIC DETAILS === */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60 mb-2">
                          Tell Us About You
                        </h1>
                        <p className="text-muted-foreground/80">
                          Build your hacker identity.
                        </p>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                            Full Name
                          </Label>
                          <div className="relative group">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                              placeholder="Name"
                              // H-11 is the standard "comfortable" size
                              className="bg-black/20 border-white/10 pl-10 h-11 focus:bg-black/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                            College / University
                          </Label>
                          <div className="relative group">
                            <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                              placeholder="BPIT, GGSIPU..."
                              className="bg-black/20 border-white/10 pl-10 h-11 focus:bg-black/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                              value={profileData.college}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  college: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                              Primary Role
                            </Label>
                            <Select
                              defaultValue={profileData.role}
                              onValueChange={(val) =>
                                setProfileData({ ...profileData, role: val })
                              }
                            >
                              <SelectTrigger className="bg-black/20 border-white/10 h-11 rounded-xl focus:ring-primary/20 px-4">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                                <SelectItem value="Frontend">
                                  Frontend Dev
                                </SelectItem>
                                <SelectItem value="Backend">
                                  Backend Dev
                                </SelectItem>
                                <SelectItem value="FullStack">
                                  Full Stack
                                </SelectItem>
                                <SelectItem value="AI/ML">
                                  AI / ML Engineer
                                </SelectItem>
                                <SelectItem value="Design">
                                  UI/UX Designer
                                </SelectItem>
                                <SelectItem value="Product">
                                  Product Manager
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                              Short Bio
                            </Label>
                            <Textarea
                              placeholder="I love building scalable systems..."
                              className="bg-black/20 border-white/10 h-11 min-h-[44px] rounded-xl focus:bg-black/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none pt-2.5"
                              value={profileData.bio}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  bio: e.target.value,
                                })
                              }
                            />
                          </div>
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
                      className="w-full"
                    >
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60 mb-2">
                          Upload Your Resume
                        </h1>
                        <p className="text-muted-foreground/80">
                          Optional: Let AI extract your skills automatically.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={() => setIsDragging(false)}
                        className={cn(
                          "border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 group/drop",
                          isDragging
                            ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]"
                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover/drop:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Drag & drop your resume
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          or click to browse (PDF, DOCX)
                        </p>
                        <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary/20 transition-colors">
                          Browse files
                        </span>
                      </motion.div>

                      <div className="text-center mt-8">
                        <Button
                          variant="ghost"
                          onClick={() => setStep(3)}
                          className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full px-5 h-10"
                        >
                          Skip for now <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* === STEP 3: CHOOSE MODE === */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60 mb-2">
                          Choose Your Mode
                        </h1>
                        <p className="text-muted-foreground/80">
                          What's your hackathon energy?
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-5">
                        {modes.map((mode) => (
                          <ModeCard
                            key={mode.variant}
                            emoji={mode.emoji}
                            title={mode.title}
                            description={mode.description}
                            variant={mode.variant}
                            selected={selectedMode === mode.variant}
                            onClick={() => setSelectedMode(mode.variant)}
                            className="h-[220px] p-6" // Proper size for cards
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
                      className="w-full"
                    >
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60 mb-2">
                          Your Tech Stack
                        </h1>
                        <p className="text-muted-foreground/80">
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
                            className="px-4 py-2 text-sm"
                          />
                        ))}
                      </div>

                      {selectedTech.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center mt-10"
                        >
                          <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-full text-sm text-primary font-medium shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                            {selectedTech.length} skill
                            {selectedTech.length !== 1 ? "s" : ""} selected
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- NAVIGATION BUTTONS --- */}
                <div className="w-full flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    disabled={step === 1}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all text-sm",
                      step === 1
                        ? "opacity-0 pointer-events-none"
                        : "text-muted-foreground hover:text-white hover:bg-white/10"
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    // Standardized button size h-11
                    className="relative overflow-hidden group h-11 px-8 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/20"
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                    <span className="relative flex items-center gap-2 font-bold text-sm">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : step === 4 ? (
                        "Start Matching"
                      ) : (
                        "Continue"
                      )}
                      {!loading && (
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
