import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  RefreshCw,
  Filter,
  Zap,
  Calendar,
  TrendingUp,
  Github,
  Loader2,
  Check,
  X,
  MapPin,
  ArrowRight,
  GraduationCap,
  Link as LinkIcon,
  PanelRight,
  PanelRightClose,
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
import { Input } from "@/components/ui/input";
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
  college: string;
}

// --- MOCK DATA (20 Profiles with Indian Names) ---
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Aarav Patel",
    role: "Frontend Architect",
    college: "BPIT, GGSIPU",
    bio: "Obsessed with pixel-perfect UI and smooth animations. I dream in CSS and GSAP. Looking for a backend wizard.",
    techStack: ["React", "TypeScript", "Tailwind", "Framer Motion", "Next.js"],
    achievements: [
      "Winner of Smart India Hackathon 2023",
      "Maintained a repo with 500+ stars",
      "Built a portfolio featured on Awwwards",
    ],
    avatarGradient: "linear-gradient(135deg, #FF6B6B 0%, #556270 100%)",
  },
  {
    id: "2",
    name: "Diya Sharma",
    role: "AI/ML Researcher",
    college: "IIT Delhi",
    bio: "Turning data into decisions. Currently working on LLMs for healthcare. Need a team to productize my research.",
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker"],
    achievements: [
      "Published paper at ICCV 2024",
      "Kaggle Grandmaster (Top 1%)",
      "Developed a COVID-19 detection model",
    ],
    avatarGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "3",
    name: "Vihaan Gupta",
    role: "Full Stack Ninja",
    college: "BPIT, GGSIPU",
    bio: "Jack of all trades, master of shipping fast. I love hackathons and caffeine. Let's build something crazy.",
    techStack: ["MERN", "Redis", "AWS", "GraphQL", "Solidity"],
    achievements: [
      "Won 1st prize at ETHIndia 2024",
      "Google Summer of Code (GSoC) 2023 Graduate",
      "Built a crypto wallet with 10k+ users",
    ],
    avatarGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    id: "4",
    name: "Ananya Singh",
    role: "UI/UX Designer",
    college: "DTU",
    bio: "I make complex systems look simple. Believer in 'User First'. Looking for devs who appreciate good design.",
    techStack: ["Figma", "Adobe XD", "Spline", "CSS", "Storybook"],
    achievements: [
      "Top rated freelancer on Upwork",
      "Designed app interface for a YC-backed startup",
      "Adobe Creative Jam Winner",
    ],
    avatarGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "5",
    name: "Rohan Malhotra",
    role: "DevOps Engineer",
    college: "BPIT, GGSIPU",
    bio: "If it works on my machine, it will work on yours. I automate everything. Let's make sure our project never crashes.",
    techStack: ["Kubernetes", "Docker", "Jenkins", "Go", "Terraform"],
    achievements: [
      "Certified Kubernetes Administrator (CKA)",
      "Reduced server costs by 40%",
      "Built a CI/CD pipeline serving 1M requests/day",
    ],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "6",
    name: "Ishita Verma",
    role: "Blockchain Developer",
    college: "NSUT",
    bio: "Decentralizing the web one smart contract at a time. Rust enthusiast. Building a DAO for student communities.",
    techStack: ["Solidity", "Rust", "Web3.js", "Hardhat", "Ether.js"],
    achievements: [
      "Polkadot Hackathon Finalist",
      "Audited smart contracts holding $50k+",
      "Core contributor to a DeFi protocol",
    ],
    avatarGradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  },
  {
    id: "7",
    name: "Aditya Kumar",
    role: "Mobile Developer",
    college: "IIIT Hyderabad",
    bio: "Flutter fanatic. I build apps that feel native on both iOS and Android. Let's win the 'Best Mobile App' category.",
    techStack: ["Flutter", "Dart", "Firebase", "Kotlin", "Swift"],
    achievements: [
      "App featured on Play Store 'App of the Week'",
      "100k+ downloads on personal app",
      "HackHarvard 2023 Track Winner",
    ],
    avatarGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: "8",
    name: "Kavya Iyer",
    role: "Data Scientist",
    college: "BITS Pilani",
    bio: "I find stories in numbers. Expert in visualization and predictive modeling. Looking for a backend dev.",
    techStack: ["Pandas", "Scikit-learn", "Tableau", "SQL", "R"],
    achievements: [
      "Gold Medalist in National Data Science Challenge",
      "Predictive model improved sales by 15%",
      "Mentor at Girls Who Code",
    ],
    avatarGradient:
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
  },
  {
    id: "9",
    name: "Arjun Reddy",
    role: "Cybersecurity Analyst",
    college: "NIT Trichy",
    bio: "White hat hacker. I break things so we can fix them. Will ensure our project is secure from day one.",
    techStack: ["Kali Linux", "Wireshark", "Python", "Bash", "PenTesting"],
    achievements: [
      "Found a critical bug in a major fintech app",
      "CTF Regional Champion",
      "Certified Ethical Hacker (CEH)",
    ],
    avatarGradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  },
  {
    id: "10",
    name: "Meera Nair",
    role: "Product Manager / Dev",
    college: "IIM Bangalore",
    bio: "Code + Business. I keep the team on track and the pitch deck looking sharp. I code a bit too (React).",
    techStack: ["Jira", "React", "Analytics", "Notion", "Python"],
    achievements: [
      "Led a student club of 200+ members",
      "Winner of 'Best Pitch' at Shark Tank College Edition",
      "Interned at Flipkart as APM",
    ],
    avatarGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    id: "11",
    name: "Siddharth Joshi",
    role: "Game Developer",
    college: "Manipal University",
    bio: "Building immersive worlds. Unity and Unreal expert. Want to gamify education or health?",
    techStack: ["Unity", "C#", "Blender", "WebGL", "Three.js"],
    achievements: [
      "Game Jam Winner (Ludum Dare)",
      "Published an indie game on Steam",
      "Created a VR tour for university campus",
    ],
    avatarGradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  },
  {
    id: "12",
    name: "Zara Khan",
    role: "Cloud Architect",
    college: "Jamia Millia Islamia",
    bio: "Scalability is my middle name. AWS Community Builder. I design systems that handle traffic spikes without sweating.",
    techStack: ["AWS Lambda", "DynamoDB", "Serverless", "Azure", "Node.js"],
    achievements: [
      "AWS Community Builder Award",
      "Architected a system handling 500 req/sec",
      "Speaker at Cloud Community Day",
    ],
    avatarGradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
  {
    id: "13",
    name: "Kabir Singh",
    role: "Backend Heavy Lifter",
    college: "Punjab Engineering College",
    bio: "Rustacean. I care about memory safety and concurrency. Your frontend needs a robust API? I got you.",
    techStack: ["Rust", "Actix", "PostgreSQL", "Redis", "gRPC"],
    achievements: [
      "Contributed to the Rust compiler",
      "Built a custom database engine for fun",
      "Ranked 1st in University Coding Contest",
    ],
    avatarGradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  },
  {
    id: "14",
    name: "Nikhil Chopra",
    role: "IoT Innovator",
    college: "Thapar University",
    bio: "Connecting hardware to the cloud. Arduino, Raspberry Pi, and ESP32 are my toys. Let's build smart tech.",
    techStack: ["C++", "MQTT", "Arduino", "Python", "Azure IoT"],
    achievements: [
      "Built a smart irrigation system for local farmers",
      "Winner of Hardware Hackathon 2023",
      "Patent pending for a wearable device",
    ],
    avatarGradient: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)",
  },
  {
    id: "15",
    name: "Riya Kapoor",
    role: "QA Automation Engineer",
    college: "Amity University",
    bio: "I hate bugs more than I love coffee. Selenium and Cypress expert. I ensure we ship quality code.",
    techStack: ["Selenium", "Cypress", "Java", "JUnit", "Jenkins"],
    achievements: [
      "Automated 90% of manual tests for a non-profit",
      "Found 50+ bugs in beta testing for a startup",
      "Wrote a viral blog on 'Testing in Production'",
    ],
    avatarGradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  },
  {
    id: "16",
    name: "Vikram Sethi",
    role: "AR/VR Developer",
    college: "SRM University",
    bio: "Merging physical and digital worlds. Experience with Meta Quest and Apple Vision Pro dev. Let's build the metaverse.",
    techStack: ["Unity", "C#", "WebXR", "A-Frame", "Three.js"],
    achievements: [
      "Created an AR history tour app used by local museums",
      "Hackathon winner for 'Best Use of AR'",
      "Published VR game on SideQuest",
    ],
    avatarGradient: "linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)",
  },
  {
    id: "17",
    name: "Sana Mir",
    role: "Fintech Specialist",
    college: "Kashmir University",
    bio: "Building the future of finance. Expert in secure transaction systems and banking APIs. Looking for a UI dev.",
    techStack: ["Java", "Spring Boot", "Kafka", "Oracle", "Microservices"],
    achievements: [
      "Built a UPI payment gateway integration",
      "Interned at a major investment bank",
      "Winner of FinTech Innovation Challenge",
    ],
    avatarGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "18",
    name: "Rahul Verma",
    role: "System Administrator",
    college: "VIT Vellore",
    bio: "Linux is my home. Bash scripting wizard. I ensure 99.99% uptime. Need a dev to build the frontend.",
    techStack: ["Linux", "Bash", "Ansible", "Nginx", "Prometheus"],
    achievements: [
      "Managed server infrastructure for a college fest",
      "Open source contributor",
      "Red Hat Certified Engineer",
    ],
    avatarGradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
  },
  {
    id: "19",
    name: "Priya Das",
    role: "Frontend Developer",
    college: "Jadavpur University",
    bio: "Creative coder. I love Vue.js and Svelte. Animations and micro-interactions are my jam.",
    techStack: ["Vue.js", "Svelte", "JavaScript", "GSAP", "Nuxt"],
    achievements: [
      "Created a CSS art gallery with 10k views",
      "Speaker at local Vue.js meetup",
      "Won 'Best UI' at State Level Hackathon",
    ],
    avatarGradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)",
  },
  {
    id: "20",
    name: "Amit Shah",
    role: "Backend Architect",
    college: "Gujarat Technological University",
    bio: "Scalable Java systems are my forte. Experience with high-frequency trading platforms. Let's build something robust.",
    techStack: ["Java", "Spring", "Hibernate", "Redis", "MySQL"],
    achievements: [
      "Optimized database queries reducing load time by 60%",
      "Built a stock trading simulator",
      "Oracle Certified Professional",
    ],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
];

const mockMatches = [
  { id: "m1", name: "Rohan Malhotra", role: "DevOps Engineer", online: true },
];

const filters = ["All", "Frontend", "Backend", "AI/ML", "Design", "Web3"];

const upcomingHackathons = [
  { name: "Smart India Hackathon", date: "Nov 15", status: "Registering" },
  { name: "HackMIT 2025", date: "Dec 02", status: "Soon" },
  { name: "ETHGlobal Online", date: "Dec 10", status: "Open" },
];

const trendingSkills = ["Rust", "Next.js 15", "Solidity", "GenAI"];

const Dashboard = () => {
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  // Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);

  // --- SLIDING WIDGET PANEL STATE ---
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const [isCampusFilterActive, setIsCampusFilterActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Github State
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "connected"
  >("idle");

  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [matches] = useState(mockMatches);

  // Profile Data Helper
  const myProfile = {
    name: userEmail ? userEmail.split("@")[0] : "Madhav Kalra",
    email: userEmail || "guest@example.com",
    role: "Full Stack Developer",
    college: "BPIT, GGSIPU",
    bio: "Passionate about building cool stuff. Looking for a hackathon team.",
    techStack: ["React", "JavaScript", "Python"],
    stats: { swipes: 42, matches: 2, karma: 950 },
  };

  // --- FILTER LOGIC ---
  useEffect(() => {
    let filtered = mockUsers;
    if (activeFilter !== "All") {
      filtered = filtered.filter((user) => {
        const roleMatch = user.role
          .toLowerCase()
          .includes(activeFilter.toLowerCase());
        const techMatch = user.techStack.some((tech) =>
          tech.toLowerCase().includes(activeFilter.toLowerCase())
        );
        return roleMatch || techMatch;
      });
    }
    if (isCampusFilterActive) {
      filtered = filtered.filter((user) => user.college === myProfile.college);
    }
    setUsers(filtered);
  }, [activeFilter, isCampusFilterActive]);

  // Handlers
  const handleSwipe = (direction: "left" | "right") => {
    if (users.length > 0) setUsers((prev) => prev.slice(1));
  };

  const handleSelectUser = (userId: string) => {
    const selectedUser = mockUsers.find((u) => u.id === userId);
    if (selectedUser) {
      setUsers([selectedUser]);
      setSearchOpen(false);
    }
  };

  const handleConfirmGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput) return;
    setShowGithubModal(false);
    setGithubStatus("loading");
    setTimeout(() => {
      let url = githubInput;
      if (!url.startsWith("http")) {
        url = `https://github.com/${url.replace(
          /^(https?:\/\/)?(www\.)?github\.com\//,
          ""
        )}`;
      }
      window.open(url, "_blank");
      setGithubStatus("connected");
      setGithubInput("");
    }, 1500);
  };

  // --- REUSABLE SIDEBAR CONTENT ---
  const SidebarContent = () => (
    <>
      {/* Profile Card */}
      <Card
        className="p-4 border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group mb-6"
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
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[120px]">
                  {myProfile.college}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Swipes
            </div>
            <div className="font-bold text-sm">{myProfile.stats.swipes}</div>
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

      {/* Hackathons */}
      <div className="mb-6">
        <div
          onClick={() => navigate("/dashboard/hackathons")}
          className="flex items-center justify-between mb-3 cursor-pointer group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
        >
          <h3 className="font-bold text-xs flex items-center gap-2 text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
            <Calendar className="w-3 h-3" /> Hackathon Radar
          </h3>
          <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
        </div>
        <div className="space-y-3">
          {upcomingHackathons.map((hack, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-transparent"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary">
                {hack.date.split(" ")[1]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {hack.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {hack.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Connect */}
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
              onClick={() => {
                if (githubStatus !== "connected") setShowGithubModal(true);
              }}
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
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => setSearchOpen(true)}
      />

      {/* 2. MAIN AREA */}
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col h-full relative">
          {/* HEADER */}
          <div className="flex-shrink-0 p-6 z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Find Your Squad{" "}
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </h1>
                <p className="text-muted-foreground text-sm">
                  Swipe right to connect.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCampusFilterActive(!isCampusFilterActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    isCampusFilterActive
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-background border-border"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isCampusFilterActive ? "My Campus" : "All Locations"}
                  </span>
                </button>

                <button
                  onClick={() => setMatchesSidebarOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border bg-background border-border relative"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Matches</span>
                  {matches.length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                  )}
                </button>

                <button
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                    rightSidebarOpen
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  {rightSidebarOpen ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRight className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">Widgets</span>
                </button>
              </div>
            </div>

            {/* FILTER PILLS */}
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
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* SWIPE DECK */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-0">
            <UserSearch
              open={searchOpen}
              onOpenChange={setSearchOpen}
              users={mockUsers}
              onSelectUser={handleSelectUser}
            />
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {users.length > 0 ? (
              <div className="flex flex-col items-center w-full max-w-md h-full z-20">
                {/* --- 1. CARD CONTAINER (TOP) --- */}
                {/* Fixed height 600px + Bigger width (max-w-md) = Big Rectangle */}
                <div className="relative w-full h-[600px] mb-8">
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

                {/* --- 2. CONTROLS CONTAINER (BOTTOM - OUTSIDE CARD) --- */}
                <div className="flex-shrink-0">
                  <SwipeControls
                    onPass={() => handleSwipe("left")}
                    onConnect={() => handleSwipe("right")}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-8 max-w-md z-20">
                <h2 className="text-2xl font-bold mb-2">No hackers found!</h2>
                <Button onClick={() => setUsers(mockUsers)} variant="outline">
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* --- SLIDING RIGHT SIDEBAR --- */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              {/* Sliding Panel - RESIZED TO w-[400px] */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border z-50 p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">Dashboard Widgets</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      <MatchesSidebar
        matches={matches}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        icebreaker="Ask about their favorite tech stack!"
      />

      {/* --- MY PROFILE MODAL --- */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
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
                    Edit
                  </Button>
                </div>
                <h2 className="text-2xl font-bold">{myProfile.name}</h2>
                <p className="text-sm text-muted-foreground">{myProfile.bio}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GITHUB MODAL --- */}
      <AnimatePresence>
        {showGithubModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGithubModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Github className="w-5 h-5" /> Connect GitHub
              </h2>
              <form onSubmit={handleConfirmGithub} className="space-y-4">
                <Input
                  placeholder="github.com/username"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowGithubModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!githubInput}>
                    Connect
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
