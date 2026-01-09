import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; // ✅ Added Toast
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

      // 🔥 Success Toast
      toast.success("Profile setup complete! Welcome aboard 🚀");

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      // 🔥 Error Toast
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Progress bar */}
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
          {/* === STEP 1: BASIC DETAILS === */}
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
                  Tell Us About You
                </h1>
                <p className="text-muted-foreground">
                  Build your hacker identity.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
                      className="pl-9"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>College / University</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="BPIT, GGSIPU..."
                      className="pl-9"
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

                <div className="space-y-2">
                  <Label>Primary Role</Label>
                  <Select
                    defaultValue={profileData.role}
                    onValueChange={(val) =>
                      setProfileData({ ...profileData, role: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend Dev</SelectItem>
                      <SelectItem value="Backend">Backend Dev</SelectItem>
                      <SelectItem value="FullStack">Full Stack</SelectItem>
                      <SelectItem value="AI/ML">AI / ML Engineer</SelectItem>
                      <SelectItem value="Design">UI/UX Designer</SelectItem>
                      <SelectItem value="Product">Product Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Short Bio</Label>
                  <Textarea
                    placeholder="I love building scalable systems..."
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* === STEP 2: RESUME UPLOAD (Optional) === */}
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
                  Optional: Let AI extract your skills automatically.
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

              <div className="text-center mt-6">
                <Button variant="ghost" onClick={() => setStep(3)}>
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
        <div className="max-w-xl mx-auto mt-12 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-foreground transition-all",
              step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-muted"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: canProceed() ? 1.05 : 1 }}
            whileTap={{ scale: canProceed() ? 0.95 : 1 }}
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
              canProceed()
                ? "gradient-primary text-primary-foreground glow-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 4 ? (
              "Start Matching"
            ) : (
              "Continue"
            )}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
