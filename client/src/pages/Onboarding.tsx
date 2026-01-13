import { useState, useRef, useEffect } from "react";
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
  Github,
  Linkedin,
  Globe,
  FileText,
  X,
  MapPin,
  Terminal,
  Plus,
  Cpu,
  Code,
  Server,
  Layers,
  Brain,
  Database,
  Shield,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
import LocationSearch from "../components/LocationSearch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- CONFIGURATION ---
const BACKEND_URL = API_BASE_URL;

// Initial suggestions (User can add more manually)
const suggestedTech = [
  "React", "Python", "TypeScript", "Node.js", "Flutter",
  "Swift", "Rust", "Go", "Java", "C++", "Machine Learning",
  "Web3", "DevOps", "UI/UX", "Mobile", "Next.js", "Docker",
  "Kubernetes", "AWS", "Firebase"
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // New State for AI Analysis Animation
  const [analyzing, setAnalyzing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [manualTechInput, setManualTechInput] = useState(""); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [noGithub, setNoGithub] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    college: "",
    location: "",
    bio: "",
    role: "Frontend",
    github: "",
    linkedin: "",
    portfolio: "",
  });

  // --- LOGIC: Simulated Hacker Terminal ---
  const runHackerSimulation = () => {
    const logs = [
      "Initializing resume parser...",
      "Extracting text layers...",
      "Identifying keywords...",
      "Matching tech stack...",
      "Optimizing profile...",
      "Done.",
    ];
    setTerminalLogs([]);
    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, log]);
      }, index * 800); 
    });

    setTimeout(() => {
      setAnalyzing(false);
      toast.success("Skills extracted successfully!");
    }, logs.length * 800 + 500);
  };

  const canProceed = () => {
    if (step === 1)
      return (
        profileData.name.length > 0 &&
        profileData.college.length > 0 &&
        profileData.location.length > 0
      );
    if (step === 2) return profileData.github.length > 0 || noGithub;
    if (step === 3) return selectedMode !== null;
    if (step === 4) return selectedTech.length > 0;
    return false;
  };

  const handleTechToggle = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleManualTechAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && manualTechInput.trim()) {
      e.preventDefault();
      const newTech = manualTechInput.trim();
      if (!selectedTech.includes(newTech)) {
        setSelectedTech((prev) => [...prev, newTech]);
      }
      setManualTechInput("");
    }
  };

  const analyzeResume = async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);

    setAnalyzing(true); 
    runHackerSimulation(); 

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/onboarding`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.aiSuggestedSkills) {
        setSelectedTech((prev) => {
          const combined = new Set([...prev, ...response.data.aiSuggestedSkills]);
          return Array.from(combined);
        });
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      analyzeResume(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setResumeFile(file);
      analyzeResume(file);
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error("User not logged in. Please refresh.");
        return;
      }

      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("college", profileData.college);
      formData.append("location", profileData.location);
      formData.append("bio", profileData.bio);
      formData.append("role", profileData.role);
      formData.append("github", noGithub ? "" : profileData.github);
      formData.append("linkedin", profileData.linkedin);
      formData.append("portfolio", profileData.portfolio);
      formData.append("mode", selectedMode || "Chill");
      formData.append("skills", JSON.stringify(selectedTech));

      if (
        coords &&
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
      ) {
        formData.append("lat", coords.lat.toString());
        formData.append("lng", coords.lng.toString());
      }

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await axios.post(`${BACKEND_URL}/api/onboarding`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      completeOnboarding();
      toast.success("Profile setup complete! Welcome aboard 🚀");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to save profile. Please check your data.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleProfileSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden selection:bg-primary/30 font-sans flex flex-col">
      {/* 1. Animated Moving Grid Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <motion.div
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />
      </motion.div>

      {/* 2. Ambient Color Glow Blobs */}
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

      {/* 3. Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
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

      {/* CONTENT AREA */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-8">
          <div className="w-full max-w-2xl">
            {/* Progress Bar Container */}
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
              <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 rounded-full -z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step - 1) / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Dynamic Glass Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="min-h-[400px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
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
                              className="bg-black/20 border-white/10 pl-10 h-11 focus:bg-black/40 focus:border-primary/50 transition-all rounded-xl"
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

                        {/* College Search */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                            College / University
                          </Label>
                          <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary z-20 pointer-events-none transition-colors duration-300" />
                            <div className="pl-0">
                              <LocationSearch
                                placeholder="Search your College..."
                                onSelect={(val) => {
                                  const fullName = val.name || "";
                                  const shortName = fullName.split(",")[0];
                                  setProfileData({
                                    ...profileData,
                                    college: shortName,
                                    location: shortName,
                                  });
                                  setCoords({ lat: val.lat, lng: val.lng });
                                }}
                                defaultValue={profileData.college}
                                className="pl-12"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* ✅ IMPROVED: Primary Role with Icons */}
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
                              <SelectTrigger className="bg-black/20 border-white/10 h-11 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/95 border-white/10 backdrop-blur-xl">
                                <SelectItem value="Frontend">
                                  <div className="flex items-center gap-2">
                                    <Code className="w-4 h-4 text-blue-400" /> <span>Frontend Dev</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="Backend">
                                  <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-green-400" /> <span>Backend Dev</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="FullStack">
                                  <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-400" /> <span>Full Stack</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="AI/ML">
                                  <div className="flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-pink-400" /> <span>AI / ML Engineer</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="Data">
                                  <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-yellow-400" /> <span>Data Engineer</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="Cybersecurity">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-400" /> <span>Cybersecurity</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="Mobile">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-orange-400" /> <span>Mobile Dev</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="DevOps">
                                  <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-gray-400" /> <span>DevOps Engineer</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* ✅ IMPROVED: Short Bio with Character Count */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                              Short Bio
                            </Label>
                            <div className="relative">
                                <Textarea
                                placeholder="Build scalable systems..."
                                maxLength={160}
                                className="bg-black/20 border-white/10 h-11 min-h-[44px] rounded-xl transition-all resize-none pt-2.5 pr-12 focus:bg-black/40 focus:border-primary/50"
                                value={profileData.bio}
                                onChange={(e) =>
                                    setProfileData({
                                    ...profileData,
                                    bio: e.target.value,
                                    })
                                }
                                />
                                <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
                                    {profileData.bio.length}/160
                                </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

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
                          Professional Profile
                        </h1>
                        <p className="text-muted-foreground/80">
                          Showcase your work and resume.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Github */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                              GitHub Profile
                            </Label>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="no-github"
                                checked={noGithub}
                                onCheckedChange={(c) => {
                                  setNoGithub(!!c);
                                  if (c)
                                    setProfileData({ ...profileData, github: "" });
                                }}
                              />
                              <Label htmlFor="no-github" className="text-xs text-muted-foreground/70 cursor-pointer">
                                I don't have one
                              </Label>
                            </div>
                          </div>
                          <div className="relative group">
                            <Github className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-white transition-colors" />
                            <Input
                              disabled={noGithub}
                              placeholder="https://github.com/username"
                              className="bg-black/20 border-white/10 pl-10 h-11 rounded-xl focus:border-primary/50 focus:bg-black/40 transition-all"
                              value={profileData.github}
                              onChange={(e) =>
                                setProfileData({ ...profileData, github: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        {/* ✅ ADDED: LinkedIn & Portfolio Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                                    LinkedIn
                                </Label>
                                <div className="relative group">
                                    <Linkedin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="linkedin.com/in/..."
                                        className="bg-black/20 border-white/10 pl-10 h-11 rounded-xl focus:border-blue-500/50 focus:bg-black/40 transition-all"
                                        value={profileData.linkedin}
                                        onChange={(e) =>
                                            setProfileData({ ...profileData, linkedin: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
                                    Portfolio / Website
                                </Label>
                                <div className="relative group">
                                    <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-green-500 transition-colors" />
                                    <Input
                                        placeholder="mywebsite.com"
                                        className="bg-black/20 border-white/10 pl-10 h-11 rounded-xl focus:border-green-500/50 focus:bg-black/40 transition-all"
                                        value={profileData.portfolio}
                                        onChange={(e) =>
                                            setProfileData({ ...profileData, portfolio: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resume */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                            Resume / CV
                          </Label>
                          {!resumeFile ? (
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={cn(
                                "border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all",
                                isDragging
                                  ? "border-primary bg-primary/10"
                                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
                              )}
                            >
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                              />
                              <Upload className="w-8 h-8 text-primary mx-auto mb-4" />
                              <h3 className="text-sm font-semibold">
                                Drop resume or click to upload
                              </h3>
                            </motion.div>
                          ) : (
                            <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {resumeFile.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setResumeFile(null)}
                                className="h-8 w-8 hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60">
                          Choose Your Mode
                        </h1>
                      </div>
                      <div className="grid md:grid-cols-3 gap-5">
                        {modes.map((mode) => (
                          <ModeCard
                            key={mode.variant}
                            {...mode}
                            selected={selectedMode === mode.variant}
                            onClick={() => setSelectedMode(mode.variant)}
                            className="h-[200px]"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      {/* ✅ ATTRACTIVE LOADING STATE: HACKER TERMINAL */}
                      {analyzing ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                          <div className="relative w-20 h-20 mb-6">
                            <motion.div 
                              className="absolute inset-0 border-4 border-primary/30 rounded-full"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                             <motion.div 
                              className="absolute inset-0 border-4 border-t-primary rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                            <Cpu className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                          </div>
                          
                          <div className="w-full max-w-sm bg-black/50 border border-primary/20 rounded-lg p-4 font-mono text-sm shadow-2xl">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                              <Terminal className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground">AI_RESUME_PARSER.exe</span>
                            </div>
                            <div className="space-y-1 h-[120px] overflow-hidden flex flex-col justify-end">
                              {terminalLogs.map((log, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="text-green-500/80"
                                >
                                  {`> ${log}`}
                                </motion.div>
                              ))}
                              <motion.div 
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-2 h-4 bg-primary inline-block"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // ✅ NORMAL TECH SELECTION VIEW (with manual input)
                        <>
                          <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60">
                              Your Tech Stack
                            </h1>
                            <p className="text-xs text-muted-foreground mt-2">
                              AI detected these. Add more if we missed something.
                            </p>
                          </div>

                          {/* Manual Input Bar */}
                          <div className="relative max-w-sm mx-auto mb-6 group">
                            <Plus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="Type a skill & press Enter (e.g. Docker)" 
                              className="pl-10 bg-black/30 border-white/10 focus:border-primary/50"
                              value={manualTechInput}
                              onChange={(e) => setManualTechInput(e.target.value)}
                              onKeyDown={handleManualTechAdd}
                            />
                          </div>

                          <div className="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                             {/* Show Selected first (AI + User) */}
                             {selectedTech.map((tech) => (
                              <TechTag
                                key={tech}
                                label={tech}
                                selected={true}
                                onClick={() => handleTechToggle(tech)}
                              />
                            ))}
                            
                            {/* Show Suggestions (excluding already selected) */}
                            {suggestedTech
                              .filter(t => !selectedTech.includes(t))
                              .map((tech) => (
                              <TechTag
                                key={tech}
                                label={tech}
                                selected={false}
                                onClick={() => handleTechToggle(tech)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* NAVIGATION BUTTONS */}
                <div className="w-full flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all text-sm",
                      step === 1
                        ? "opacity-0 pointer-events-none"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || loading || analyzing} // Disable while analyzing
                    className="relative h-11 px-8 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="relative flex items-center gap-2 font-bold">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : step === 4 ? (
                        "Start Matching"
                      ) : (
                        "Continue"
                      )}
                      {!loading && <ArrowRight className="w-5 h-5" />}
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