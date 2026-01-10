import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Lightbulb,
  Loader2,
  Code2,
  Cpu,
  Target,
  Users,
  Zap,
  X,
  Plus,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Terminal,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import API_BASE_URL from "@/lib/api";

// --- CONFIGURATION ---
const BACKEND_URL = `${API_BASE_URL}`;

// --- TYPES ---
interface ProjectIdea {
  title: string;
  tagline?: string; // New field for the "cool" short summary
  desc: string;
  long_desc: string;
  features: string[];
  stack: string[];
  difficulty: string;
  matchScore?: string; // New field for "AI Match %"
}

// --- MOCK DATA (Fallback) ---
const MOCK_IDEAS: ProjectIdea[] = [
  {
    title: "EcoSmart Tracker",
    tagline: "AI-driven carbon footprint analysis for retail.",
    desc: "An AI-powered dashboard that tracks carbon footprint from grocery receipts automatically.",
    long_desc:
      "EcoSmart Tracker is a sustainability platform that empowers users to make greener purchasing decisions. By simply scanning a grocery receipt, the app uses OCR and extensive carbon footprint databases to calculate the environmental impact of each item.",
    features: ["Receipt OCR", "Carbon Analytics", "Gamified Goals"],
    stack: ["React", "Vision API", "Node.js"],
    difficulty: "Intermediate",
    matchScore: "98%",
  },
  {
    title: "HealthChain Records",
    tagline: "Decentralized patient data sovereignty.",
    desc: "A decentralized platform for securely sharing patient medical history between hospitals.",
    long_desc:
      "HealthChain aims to solve the interoperability crisis in healthcare. It uses a private blockchain to store hashes of medical records, ensuring patient data ownership and privacy.",
    features: ["Decentralized Identity", "IPFS Storage", "QR Access"],
    stack: ["Solidity", "Next.js", "IPFS"],
    difficulty: "Advanced",
    matchScore: "92%",
  },
  {
    title: "EduVoice Assistant",
    tagline: "Voice-first study companion for active recall.",
    desc: "A voice-activated study companion that quizzes students based on their notes.",
    long_desc:
      "EduVoice transforms static PDF notes into an interactive oral exam. Students upload their lecture notes, and the AI generates a conversational quiz.",
    features: ["PDF Parsing", "Voice AI", "Spaced Repetition"],
    stack: ["Python", "Whisper AI", "React"],
    difficulty: "Beginner",
    matchScore: "89%",
  },
];

const IdeaSpark = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);

  // --- NEW FORM STATE ---
  const [currentSkill, setCurrentSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [teamSize, setTeamSize] = useState(4);

  // --- HANDLERS ---
  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleGenerate = async () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill to your arsenal!");
      return;
    }

    setLoading(true);
    setIdeas([]);
    setSelectedIdea(null);

    // Prepare data for backend
    const payload = {
      skills, // Sending array instead of string
      theme,
      teamSize,
      // Maintaining backward compatibility if your backend expects string
      mySkills: skills.join(", "), 
      partnerSkills: theme, 
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/idea-spark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setIdeas(data.ideas);
      toast.success("Mission Objectives Acquired! 🚀");
    } catch (err) {
      console.error("Using Fallback:", err);
      toast.warning("AI Link Unstable. Loading Tactical Simulations.");
      await new Promise((r) => setTimeout(r, 1500)); // Fake delay for realism
      setIdeas(MOCK_IDEAS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-foreground font-sans overflow-hidden selection:bg-purple-500/30">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" /> The Idea Forge
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Input your squad's combined tech stack and mission parameters. 
              Our AI architect will construct the optimal hackathon project for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT: MISSION CONTROL (INPUTS) --- */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                {/* 1. SECTOR SELECTOR */}
                <div className="mb-8 relative z-10">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Target Sector
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Fintech", "Health", "EdTech", "Web3", "AI", "Open"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
                          theme === t 
                          ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. TEAM SIZE SLIDER */}
                <div className="mb-8 relative z-10">
                   <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Users className="w-3 h-3" /> Squad Size
                      </label>
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {teamSize} Units
                      </span>
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="6" 
                     value={teamSize}
                     onChange={(e) => setTeamSize(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                   />
                </div>

                {/* 3. TECH ARSENAL (TAG INPUT) */}
                <div className="mb-8 relative z-10">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                     <Code2 className="w-3 h-3" /> Tech Arsenal
                   </label>
                   
                   <div className="flex gap-2 mb-3">
                     <div className="relative flex-1 group/input">
                       <Input 
                         value={currentSkill}
                         onChange={(e) => setCurrentSkill(e.target.value)}
                         onKeyDown={handleKeyDown}
                         placeholder="Add tech (e.g. React, Python)..." 
                         className="bg-black/50 border-white/10 focus:border-purple-500/50 transition-all pl-9"
                       />
                       <Terminal className="w-4 h-4 absolute left-3 top-3 text-muted-foreground group-focus-within/input:text-purple-500 transition-colors" />
                     </div>
                     <Button size="icon" onClick={addSkill} className="bg-white/10 hover:bg-white/20 text-white border border-white/5">
                       <Plus className="w-4 h-4" />
                     </Button>
                   </div>

                   <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-black/20 rounded-xl border border-white/5 content-start">
                     {skills.length === 0 && (
                       <span className="text-xs text-muted-foreground/40 italic flex items-center gap-2">
                         <Cpu className="w-3 h-3" /> System idle. Add capabilities.
                       </span>
                     )}
                     <AnimatePresence>
                       {skills.map((skill) => (
                         <motion.div
                           key={skill}
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           exit={{ scale: 0 }}
                         >
                           <Badge variant="secondary" className="pl-3 pr-1 py-1 h-7 gap-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20">
                             {skill}
                             <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                               <X className="w-3 h-3" />
                             </button>
                           </Badge>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                   </div>
                </div>

                {/* GENERATE BUTTON */}
                <Button 
                   onClick={handleGenerate} 
                   disabled={loading}
                   className="w-full h-14 relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.01] transition-all font-bold text-lg shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)] rounded-xl group/btn"
                >
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                   {loading ? (
                     <span className="flex items-center gap-2 relative z-10">
                       <Loader2 className="w-5 h-5 animate-spin" /> Uplinking to Gemini...
                     </span>
                   ) : (
                     <span className="flex items-center gap-2 relative z-10">
                       <Zap className="w-5 h-5 fill-current" /> Initialize Forge
                     </span>
                   )}
                </Button>
              </Card>
            </div>

            {/* --- RIGHT: OUTPUT FEED --- */}
            <div className="lg:col-span-7">
              {ideas.length === 0 && !loading ? (
                 <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 p-12 text-center opacity-50">
                    <Cpu className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">Awaiting Input</h3>
                    <p className="text-sm max-w-xs mx-auto">Configure mission parameters on the left to begin generation.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {ideas.map((idea, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card 
                        onClick={() => setSelectedIdea(idea)}
                        className="group p-6 bg-black/40 border-white/10 hover:border-purple-500/50 hover:bg-black/60 transition-all cursor-pointer relative overflow-hidden backdrop-blur-md"
                      >
                         {/* Hover Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                         <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                    {idea.title}
                                  </h3>
                                  <Badge className="bg-white/10 text-white hover:bg-white/20 border-0 text-[10px] uppercase tracking-wider">
                                    {idea.difficulty}
                                  </Badge>
                               </div>
                               <p className="text-sm text-purple-300 font-medium font-mono">
                                 {idea.tagline || "Innovative Hackathon Solution"}
                               </p>
                            </div>
                            <div className="text-right">
                               <div className="text-2xl font-black text-white/10 group-hover:text-purple-400/80 transition-colors">
                                 {idea.matchScore || "95%"}
                               </div>
                               <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Match</div>
                            </div>
                         </div>

                         <p className="text-muted-foreground text-sm line-clamp-2 mb-5 relative z-10">
                           {idea.desc}
                         </p>

                         <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                            <div className="flex -space-x-2">
                               {idea.stack.slice(0,3).map((tech, i) => (
                                 <div key={tech} className="px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs text-gray-300 shadow-lg z-0" style={{ zIndex: 10-i }}>
                                   {tech}
                                 </div>
                               ))}
                               {idea.stack.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white z-0">
                                    +{idea.stack.length - 3}
                                  </div>
                               )}
                            </div>
                            <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                              View Blueprint <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- BLUEPRINT MODAL --- */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-8 pb-4 relative">
                <div className="absolute top-0 right-0 p-4">
                   <Button variant="ghost" size="icon" onClick={() => setSelectedIdea(null)} className="rounded-full hover:bg-white/10">
                     <X className="w-5 h-5" />
                   </Button>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                   <Badge className="bg-purple-500 text-white border-0 hover:bg-purple-600">
                     {selectedIdea.difficulty}
                   </Badge>
                   <span className="text-xs text-purple-400 font-mono flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> AI Confidence: {selectedIdea.matchScore || "95%"}
                   </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedIdea.title}</h2>
                <p className="text-lg text-muted-foreground">{selectedIdea.tagline || selectedIdea.desc}</p>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 pt-2 overflow-y-auto custom-scrollbar">
                 <div className="mb-8 p-5 bg-white/5 rounded-xl border border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" /> Executive Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedIdea.long_desc}
                    </p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                         <Rocket className="w-4 h-4 text-blue-400" /> Core Features
                       </h3>
                       <ul className="space-y-3">
                         {selectedIdea.features.map((feature, i) => (
                           <li key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                             <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                             <span className="text-sm text-gray-300">{feature}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                    
                    <div>
                       <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                         <Code2 className="w-4 h-4 text-pink-400" /> Tech Stack
                       </h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedIdea.stack.map(tech => (
                           <Badge key={tech} variant="outline" className="px-3 py-1.5 border-white/10 bg-white/5 text-gray-300">
                             {tech}
                           </Badge>
                         ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setSelectedIdea(null)}>Close Blueprint</Button>
                 <Button className="bg-white text-black hover:bg-gray-200 font-bold">
                   Initialize Repository
                 </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaSpark;