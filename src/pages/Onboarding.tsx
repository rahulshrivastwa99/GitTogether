import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ModeCard } from "@/components/ModeCard";
import { TechTag } from "@/components/TechTag";
import { cn } from "@/lib/utils";

const techOptions = [
  "React", "Python", "TypeScript", "Node.js", "Flutter", 
  "Swift", "Rust", "Go", "Java", "C++",
  "Machine Learning", "Web3", "DevOps", "UI/UX", "Mobile"
];

const modes = [
  { emoji: "🔥", title: "Beast Mode", description: "Here to win. No sleep.", variant: "beast" as const },
  { emoji: "☕", title: "Chill Mode", description: "Here to learn & vibe.", variant: "chill" as const },
  { emoji: "🎓", title: "Newbie Mode", description: "First timer. Help me.", variant: "newbie" as const },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleTechToggle = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return selectedMode !== null;
    if (step === 3) return selectedTech.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
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
        {/* Progress bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                  s === step
                    ? "gradient-primary text-primary-foreground glow-primary"
                    : s < step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Resume Upload */}
          {step === 1 && (
            <motion.div
              key="step1"
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
                  onClick={() => setStep(2)}
                  className="text-primary hover:underline"
                >
                  Skip for now
                </button>
              </p>
            </motion.div>
          )}

          {/* Step 2: Choose Mode */}
          {step === 2 && (
            <motion.div
              key="step2"
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

          {/* Step 3: Tech Stack */}
          {step === 3 && (
            <motion.div
              key="step3"
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
                  {selectedTech.length} skill{selectedTech.length !== 1 ? "s" : ""} selected
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="max-w-xl mx-auto mt-12 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: step > 1 ? 1.05 : 1 }}
            whileTap={{ scale: step > 1 ? 0.95 : 1 }}
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
              step > 1
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
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
            {step === 3 ? "Start Matching" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
