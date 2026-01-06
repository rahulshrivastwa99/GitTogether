import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  RefreshCw,
  Filter,
  Zap,
  Calendar,
  TrendingUp,
  Sparkles,
  Search,
  Github,
  Loader2,
  Check,
  X,
  GraduationCap,
} from "lucide-react";

// Components
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { MatchesSidebar } from "@/components/MatchesSidebar";
import { UserSearch } from "@/components/UserSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- IMPORT AUTH CONTEXT ---
import { useAuth } from "@/context/AuthContext";

// --- TYPES ---
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  techStack: string[];
  achievements: string[];
  avatarGradient: string;
}

// --- MOCK DATA (12 Selected Profiles) ---
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Aarav Patel",
    role: "Frontend Architect",
    bio: "Obsessed with pixel-perfect UI. I dream in CSS and Framer Motion. Looking for a backend wizard.",
    techStack: ["React", "TypeScript", "Tailwind", "Next.js"],
    achievements: [
      "Winner of Smart India Hackathon 2023",
      "500+ Stars on GitHub",
    ],
    avatarGradient: "linear-gradient(135deg, #FF6B6B 0%, #556270 100%)",
  },
  {
    id: "2",
    name: "Diya Sharma",
    role: "AI/ML Researcher",
    bio: "Turning data into decisions. Currently working on LLMs for healthcare.",
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    achievements: ["Published paper at ICCV 2024", "Kaggle Grandmaster"],
    avatarGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "3",
    name: "Vihaan Gupta",
    role: "Full Stack Ninja",
    bio: "Jack of all trades, master of shipping fast. I love hackathons and caffeine.",
    techStack: ["MERN", "Redis", "AWS", "GraphQL"],
    achievements: ["Won 1st prize at ETHIndia", "GSoC 2023 Graduate"],
    avatarGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    id: "4",
    name: "Ananya Singh",
    role: "UI/UX Designer",
    bio: "I make complex systems look simple. Believer in 'User First'.",
    techStack: ["Figma", "Spline", "CSS", "Storybook"],
    achievements: ["Top rated freelancer", "Adobe Creative Jam Winner"],
    avatarGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "5",
    name: "Rohan Malhotra",
    role: "DevOps Engineer",
    bio: "If it works on my machine, it will work on yours. I automate everything.",
    techStack: ["Kubernetes", "Docker", "Go", "Terraform"],
    achievements: ["Certified Kubernetes Admin", "Reduced costs by 40%"],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "6",
    name: "Ishita Verma",
    role: "Blockchain Developer",
    bio: "Decentralizing the web one smart contract at a time. Rust enthusiast.",
    techStack: ["Solidity", "Rust", "Web3.js", "Hardhat"],
    achievements: ["Polkadot Hackathon Finalist", "Audited $50k+ contracts"],
    avatarGradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  },
  {
    id: "7",
    name: "Aditya Kumar",
    role: "Mobile Developer",
    bio: "Flutter fanatic. I build apps that feel native on both iOS and Android.",
    techStack: ["Flutter", "Dart", "Firebase", "Kotlin"],
    achievements: ["App featured on Play Store", "100k+ downloads"],
    avatarGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: "8",
    name: "Kavya Iyer",
    role: "Data Scientist",
    bio: "I find stories in numbers. Expert in visualization and predictive modeling.",
    techStack: ["Pandas", "Scikit-learn", "Tableau", "SQL"],
    achievements: [
      "Gold Medalist Data Challenge",
      "Predictive model +15% sales",
    ],
    avatarGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  {
    id: "9",
    name: "Arjun Reddy",
    role: "Cybersecurity Analyst",
    bio: "White hat hacker. I break things so we can fix them. Ensuring security first.",
    techStack: ["Kali Linux", "Python", "Bash", "PenTesting"],
    achievements: ["Found critical bug in fintech", "CTF Regional Champion"],
    avatarGradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  },
  {
    id: "10",
    name: "Meera Nair",
    role: "Product Manager",
    bio: "Code + Business. I keep the team on track and the pitch deck looking sharp.",
    techStack: ["Jira", "React", "Analytics", "Notion"],
    achievements: ["Led club of 200+ members", "Winner 'Best Pitch'"],
    avatarGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    id: "11",
    name: "Siddharth Joshi",
    role: "Game Developer",
    bio: "Building immersive worlds. Unity and Unreal expert. Gamifying education.",
    techStack: ["Unity", "C#", "Blender", "WebGL"],
    achievements: ["Game Jam Winner", "Published indie game"],
    avatarGradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  },
  {
    id: "12",
    name: "Zara Khan",
    role: "Cloud Architect",
    bio: "Scalability is my middle name. AWS Community Builder.",
    techStack: ["AWS Lambda", "DynamoDB", "Serverless", "Node.js"],
    achievements: ["AWS Community Builder", "Handled 500 req/sec"],
    avatarGradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
];

const mockMatches = [
  { id: "m1", name: "Rohan Malhotra", role: "DevOps Engineer", online: true },
  {
    id: "m2",
    name: "Ishita Verma",
    role: "Blockchain Developer",
    online: false,
  },
];

const filters = ["All", "Frontend", "Backend", "AI/ML", "Design", "Web3"];

const upcomingHackathons = [
  { name: "Smart India Hackathon", date: "Nov 15", status: "Registering" },
  { name: "HackMIT 2025", date: "Dec 02", status: "Soon" },
  { name: "ETHGlobal Online", date: "Dec 10", status: "Open" },
];

const trendingSkills = ["Rust", "Next.js 15", "Solidity", "GenAI"];

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  // Access Auth Context
  const { userEmail } = useAuth();

  // Layout & UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);

  // Profile System State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "connected"
  >("idle");

  // Data State
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [matches] = useState(mockMatches);

  // --- DYNAMIC USER PROFILE (From Login) ---
  // Helper to extract name from email (e.g. madhav.kalra@bpit.edu -> Madhav Kalra)
  const formatNameFromEmail = (email: string | null) => {
    if (!email) return "Guest User";
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatCollegeFromEmail = (email: string | null) => {
    if (!email) return "University";
    const domain = email.split("@")[1];
    if (domain.includes("bpit")) return "BPIT, GGSIPU";
    if (domain.includes("iit")) return "IIT Delhi";
    return domain.split(".")[0].toUpperCase() + " University";
  };

  const myProfile = {
    name: formatNameFromEmail(userEmail),
    email: userEmail || "guest@example.com",
    role: "Student Developer", // Default role
    college: formatCollegeFromEmail(userEmail),
    bio: "Passionate about building cool stuff. Looking for a hackathon team to ship projects that matter.",
    techStack: ["React", "JavaScript", "Python"], // Default stack
    stats: { swipes: 12, matches: 0, karma: 100 },
  };

  // --- FILTER LOGIC ---
  useEffect(() => {
    if (activeFilter === "All") {
      setUsers(mockUsers);
    } else {
      const filtered = mockUsers.filter((user) => {
        const roleMatch = user.role
          .toLowerCase()
          .includes(activeFilter.toLowerCase());
        const techMatch = user.techStack.some(
          (tech) =>
            tech.toLowerCase().includes(activeFilter.toLowerCase()) ||
            (activeFilter === "Frontend" &&
              ["React", "Vue", "Angular", "CSS", "UI"].some((t) =>
                tech.includes(t)
              )) ||
            (activeFilter === "Backend" &&
              ["Node", "Java", "Go", "Python", "SQL"].some((t) =>
                tech.includes(t)
              )) ||
            (activeFilter === "AI/ML" &&
              ["Python", "TensorFlow", "Pandas", "AI"].some((t) =>
                tech.includes(t)
              )) ||
            (activeFilter === "Web3" &&
              ["Solidity", "Rust", "Blockchain"].some((t) =>
                tech.includes(t)
              )) ||
            (activeFilter === "Design" &&
              ["Figma", "Adobe", "UX"].some((t) => tech.includes(t)))
        );
        return roleMatch || techMatch;
      });
      setUsers(filtered);
    }
  }, [activeFilter]);

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    if (users.length > 0) {
      setUsers((prev) => prev.slice(1));
    }
  };

  const handleSelectUser = (userId: string) => {
    const selectedUser = mockUsers.find((u) => u.id === userId);
    if (selectedUser) {
      setUsers([selectedUser]);
      setSearchOpen(false);
    }
  };

  const handleReset = () => {
    if (activeFilter === "All") {
      setUsers(mockUsers);
    } else {
      const temp = activeFilter;
      setActiveFilter("All");
      setTimeout(() => setActiveFilter(temp), 10);
    }
  };

  const handleConnectGithub = () => {
    if (githubStatus === "connected") return;
    setGithubStatus("loading");
    setTimeout(() => {
      setGithubStatus("connected");
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => setSearchOpen(true)}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* CENTER COLUMN: SWIPE AREA */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Header & Filter Bar */}
          <div className="flex-shrink-0 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Find Your Squad{" "}
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </h1>
                <p className="text-muted-foreground text-sm">
                  Swipe right to connect, left to skip.
                </p>
              </div>

              {/* Mobile: Matches Toggle */}
              <Button
                onClick={() => setMatchesSidebarOpen(true)}
                variant="secondary"
                className="lg:hidden relative gap-2 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Matches</span>
                {matches.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 border-dashed flex-shrink-0"
              >
                <Filter className="w-3 h-3" /> Filters
              </Button>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeFilter === f
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Swipe/Card Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-0">
            <UserSearch
              open={searchOpen}
              onOpenChange={setSearchOpen}
              users={mockUsers}
              onSelectUser={handleSelectUser}
            />

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {users.length > 0 ? (
              <>
                <div className="relative w-full max-w-sm aspect-[3/4] max-h-[500px] z-20">
                  <AnimatePresence mode="popLayout">
                    {users
                      .slice(0, 3)
                      .map((user, index) => (
                        <SwipeCard
                          key={user.id}
                          user={user}
                          onSwipe={handleSwipe}
                          isTop={index === 0}
                        />
                      ))
                      .reverse()}
                  </AnimatePresence>
                </div>

                <div className="mt-6 z-20 flex-shrink-0 pb-2">
                  <SwipeControls
                    onPass={() => handleSwipe("left")}
                    onConnect={() => handleSwipe("right")}
                  />
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 max-w-md z-20"
              >
                <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center animate-pulse">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  No more {activeFilter !== "All" ? activeFilter : ""}{" "}
                  developers!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try changing the filter or check back later.
                </p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WIDGETS */}
        <aside className="w-80 border-l border-border bg-card/30 backdrop-blur-xl p-6 hidden xl:flex flex-col gap-6 h-full overflow-y-auto flex-shrink-0">
          {/* Widget 1: Profile (CLICKABLE) */}
          <Card
            className="p-4 border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`}
                  />
                  <AvatarFallback>{myProfile.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                    {myProfile.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1 text-green-500 border-green-500/20 bg-green-500/10"
                  >
                    Online
                  </Badge>
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setMatchesSidebarOpen(true);
                }}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Swipes
                </div>
                <div className="font-bold text-sm">
                  {myProfile.stats.swipes}
                </div>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Matches
                </div>
                <div className="font-bold text-sm text-primary">
                  {matches.length}
                </div>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Karma
                </div>
                <div className="font-bold text-sm">{myProfile.stats.karma}</div>
              </div>
            </div>
          </Card>

          {/* Widget 2: Hackathons */}
          <div>
            <h3 className="font-bold text-xs mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Hackathon Radar
            </h3>
            <div className="space-y-3">
              {upcomingHackathons.map((hack, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary group-hover:scale-105 transition-transform">
                    {hack.date.split(" ")[1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {hack.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          hack.status === "Open"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      {hack.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Trending */}
          <div>
            <h3 className="font-bold text-xs mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" /> Trending Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors text-xs"
                >
                  # {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Widget 4: Pro Tip & GitHub Connect */}
          <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                <Github className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-purple-100 mb-1">
                  Boost Your Profile
                </h4>
                <p className="text-xs text-purple-200/70 mb-3">
                  Add a GitHub repo to get 3x more matches.
                </p>

                <Button
                  size="sm"
                  variant="secondary"
                  className={`w-full h-8 text-xs border-none transition-all ${
                    githubStatus === "connected"
                      ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                  }`}
                  onClick={handleConnectGithub}
                  disabled={githubStatus !== "idle"}
                >
                  {githubStatus === "loading" && (
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  )}
                  {githubStatus === "connected" && (
                    <Check className="w-3 h-3 mr-2" />
                  )}
                  {githubStatus === "idle"
                    ? "Connect GitHub"
                    : githubStatus === "loading"
                    ? "Connecting..."
                    : "Connected"}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* 3. RIGHT SIDEBAR (Matches & Chat) */}
      <MatchesSidebar
        matches={matches}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        icebreaker="Ask about their favorite tech stack!"
      />

      {/* --- MY PROFILE MODAL --- */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-24 bg-gradient-to-r from-primary to-purple-500/50" />
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4 flex justify-between items-end">
                  <Avatar className="h-24 w-24 border-4 border-background bg-card">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`}
                    />
                    <AvatarFallback>{myProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Edit Profile
                  </Button>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">{myProfile.name}</h2>
                  <p className="text-primary font-medium">{myProfile.role}</p>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <GraduationCap className="w-4 h-4" />
                    {myProfile.college}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      About
                    </h4>
                    <p className="text-sm leading-relaxed">{myProfile.bio}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {myProfile.techStack.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
