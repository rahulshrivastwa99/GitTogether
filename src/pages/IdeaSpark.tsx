import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  Loader2,
  Code2,
  Cpu,
  AlertCircle,
  WifiOff,
  X,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import API_BASE_URL from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area"; // Ensure you have this or standard div

// --- CONFIGURATION ---
const BACKEND_URL = `${API_BASE_URL}`;

// Updated Interface to include more details
interface ProjectIdea {
  title: string;
  desc: string; // Short summary for the card
  long_desc: string; // Detailed explanation for the modal
  features: string[]; // List of specific features
  stack: string[];
  difficulty: string;
}

// --- UPDATED FALLBACK IDEAS (With details) ---
const MOCK_IDEAS: ProjectIdea[] = [
  {
    title: "EcoSmart Tracker",
    desc: "An AI-powered dashboard that tracks carbon footprint from grocery receipts automatically.",
    long_desc:
      "EcoSmart Tracker is a sustainability platform that empowers users to make greener purchasing decisions. By simply scanning a grocery receipt, the app uses OCR and extensive carbon footprint databases to calculate the environmental impact of each item. It visualizes this data over time and offers eco-friendly alternatives for high-impact products.",
    features: [
      "Receipt Scanning via OCR",
      "Carbon Footprint Analytics",
      "Eco-friendly Product Recommendations",
      "Gamified Sustainability Goals",
    ],
    stack: ["React", "Vision API", "Node.js"],
    difficulty: "Intermediate",
  },
  {
    title: "HealthChain Records",
    desc: "A decentralized platform for securely sharing patient medical history between hospitals.",
    long_desc:
      "HealthChain aims to solve the interoperability crisis in healthcare. It uses a private blockchain to store hashes of medical records, ensuring patient data ownership and privacy. Patients grant temporary access keys to doctors via a QR code, allowing seamless transfer of history without centralized database risks.",
    features: [
      "Decentralized Identity (DID)",
      "Encrypted Record Storage (IPFS)",
      "QR Code Access Sharing",
      "Audit Logs for Privacy",
    ],
    stack: ["Solidity", "Next.js", "IPFS"],
    difficulty: "Advanced",
  },
  {
    title: "EduVoice Assistant",
    desc: "A voice-activated study companion that quizzes students based on their notes.",
    long_desc:
      "EduVoice transforms static PDF notes into an interactive oral exam. Students upload their lecture notes, and the AI generates a conversational quiz. It uses speech-to-text to listen to answers and provides real-time feedback on accuracy and completeness, simulating a viva voce exam.",
    features: [
      "PDF to Quiz Generation",
      "Voice Recognition Interface",
      "Spaced Repetition Algorithms",
      "Progress Tracking Dashboard",
    ],
    stack: ["Python", "Whisper AI", "React"],
    difficulty: "Beginner",
  },
];

const IdeaSpark = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mySkills, setMySkills] = useState("");
  const [partnerSkills, setPartnerSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  // New State for the Modal
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);

  const handleGenerate = async () => {
    if (!mySkills) return;

    setLoading(true);
    setError("");
    setUsedFallback(false);
    setIdeas([]);
    setSelectedIdea(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/idea-spark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mySkills,
          partnerSkills,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (err: any) {
      console.error("Backend API Failed, switching to fallback:", err);
      await new Promise((r) => setTimeout(r, 1000));
      setIdeas(MOCK_IDEAS);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Idea Spark</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powered by Google Gemini. Enter your tech stack below and let AI
              generate winning hackathon ideas.
            </p>
          </div>

          {/* Input Section */}
          <Card className="p-8 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm mb-12">
            {usedFallback && (
              <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Offline Mode</AlertTitle>
                <AlertDescription>
                  AI Service unreachable. Showing demo ideas based on your
                  stack.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-500" /> Your Skills
                </label>
                <Input
                  placeholder="e.g. React, Node.js, Tailwind"
                  value={mySkills}
                  onChange={(e) => setMySkills(e.target.value)}
                  className="h-12 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-pink-500" /> Partner's Skills
                  (Optional)
                </label>
                <Input
                  placeholder="e.g. Python, AI, Solidity"
                  value={partnerSkills}
                  onChange={(e) => setPartnerSkills(e.target.value)}
                  className="h-12 bg-background"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !mySkills}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Asking
                  Backend...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5 mr-2" /> Generate Ideas
                </>
              )}
            </Button>
          </Card>

          {/* Results Grid */}
          {ideas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {ideas.map((idea, idx) => (
                <Card
                  key={idx}
                  onClick={() => setSelectedIdea(idea)} // Click to open modal
                  className="p-6 border-border/50 hover:border-purple-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group bg-card cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Rocket className="w-5 h-5 text-purple-500" />
                  </div>

                  <div className="mb-4 flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                      {idea.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {idea.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {idea.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {idea.stack.slice(0, 3).map((tech: string) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs bg-secondary/50"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {idea.stack.length > 3 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{idea.stack.length - 3}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* --- IDEA DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-start justify-between bg-muted/20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{selectedIdea.title}</h2>
                    <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 border-purple-500/20">
                      {selectedIdea.difficulty}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedIdea.desc}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIdea(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Concept Blueprint
                  </h3>
                  <p className="text-foreground leading-relaxed text-lg">
                    {selectedIdea.long_desc}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Rocket className="w-4 h-4" /> Key Features
                    </h3>
                    <ul className="space-y-3">
                      {selectedIdea.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Code2 className="w-4 h-4" /> Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdea.stack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="px-3 py-1 text-sm"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedIdea(null)}>
                  Close
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Start Project
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
