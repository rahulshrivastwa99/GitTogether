import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Filter,
  Zap,
  Calendar,
  Github,
  Loader2,
  Check,
  X,
  MapPin,
  ArrowRight,
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
  stats: {
    completionRate: number;
    activityLevel: "High" | "Medium" | "Low";
    availability: number;
  };
}

// --- FULL MOCK DATA (20 Profiles) ---
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Aarav Patel",
    role: "Frontend Architect",
    college: "BPIT, GGSIPU",
    bio: "Obsessed with pixel-perfect UI. I dream in CSS. Looking for a backend wizard.",
    techStack: ["React", "TypeScript", "Tailwind", "Next.js"],
    achievements: ["Winner of Smart India Hackathon 2023"],
    avatarGradient: "linear-gradient(135deg, #FF6B6B 0%, #556270 100%)",
    stats: { completionRate: 95, activityLevel: "High", availability: 20 },
  },
  {
    id: "2",
    name: "Diya Sharma",
    role: "AI/ML Researcher",
    college: "IIT Delhi",
    bio: "Turning data into decisions. Currently working on LLMs for healthcare.",
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    achievements: ["Published paper at ICCV 2024"],
    avatarGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    stats: { completionRate: 70, activityLevel: "Medium", availability: 10 },
  },
  {
    id: "3",
    name: "Vihaan Gupta",
    role: "Full Stack Ninja",
    college: "BPIT, GGSIPU",
    bio: "Jack of all trades, master of shipping fast. I love hackathons.",
    techStack: ["MERN", "Redis", "AWS", "GraphQL"],
    achievements: ["Won 1st prize at ETHIndia 2024"],
    avatarGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    stats: { completionRate: 40, activityLevel: "Low", availability: 5 },
  },
  {
    id: "4",
    name: "Ananya Singh",
    role: "UI/UX Designer",
    college: "DTU",
    bio: "I make complex systems look simple. Believer in 'User First'.",
    techStack: ["Figma", "Adobe XD", "Spline", "CSS"],
    achievements: ["Top rated freelancer"],
    avatarGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    stats: { completionRate: 88, activityLevel: "High", availability: 15 },
  },
  {
    id: "5",
    name: "Rohan Malhotra",
    role: "DevOps Engineer",
    college: "BPIT, GGSIPU",
    bio: "If it works on my machine, it will work on yours. I automate everything.",
    techStack: ["Kubernetes", "Docker", "Go", "Terraform"],
    achievements: ["Certified Kubernetes Administrator"],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    stats: { completionRate: 92, activityLevel: "High", availability: 25 },
  },
  {
    id: "6",
    name: "Ishita Verma",
    role: "Blockchain Developer",
    college: "NSUT",
    bio: "Decentralizing the web. Rust enthusiast building DAOs.",
    techStack: ["Solidity", "Rust", "Web3.js", "Hardhat"],
    achievements: ["Polkadot Hackathon Finalist"],
    avatarGradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    stats: { completionRate: 60, activityLevel: "Medium", availability: 8 },
  },
  {
    id: "7",
    name: "Aditya Kumar",
    role: "Mobile Developer",
    college: "IIIT Hyderabad",
    bio: "Flutter fanatic. I build apps that feel native on both iOS and Android.",
    techStack: ["Flutter", "Dart", "Firebase", "Kotlin"],
    achievements: ["App featured on Play Store"],
    avatarGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    stats: { completionRate: 30, activityLevel: "Low", availability: 4 },
  },
  {
    id: "8",
    name: "Kavya Iyer",
    role: "Data Scientist",
    college: "BITS Pilani",
    bio: "I find stories in numbers. Expert in visualization and predictive modeling.",
    techStack: ["Pandas", "Scikit-learn", "Tableau", "SQL"],
    achievements: ["Gold Medalist in Data Challenge"],
    avatarGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    stats: { completionRate: 85, activityLevel: "High", availability: 18 },
  },
  {
    id: "9",
    name: "Arjun Reddy",
    role: "Cybersecurity Analyst",
    college: "NIT Trichy",
    bio: "White hat hacker. I break things so we can fix them.",
    techStack: ["Kali Linux", "Wireshark", "Python", "Bash"],
    achievements: ["CTF Regional Champion"],
    avatarGradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    stats: { completionRate: 75, activityLevel: "Medium", availability: 12 },
  },
  {
    id: "10",
    name: "Meera Nair",
    role: "Product Manager",
    college: "IIM Bangalore",
    bio: "Code + Business. I keep the team on track and the pitch deck looking sharp.",
    techStack: ["Jira", "React", "Analytics", "Notion"],
    achievements: ["Best Pitch at Shark Tank College"],
    avatarGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    stats: { completionRate: 98, activityLevel: "High", availability: 30 },
  },
  {
    id: "11",
    name: "Siddharth Joshi",
    role: "Game Developer",
    college: "Manipal University",
    bio: "Building immersive worlds. Unity and Unreal expert.",
    techStack: ["Unity", "C#", "Blender", "WebGL"],
    achievements: ["Published game on Steam"],
    avatarGradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    stats: { completionRate: 55, activityLevel: "Medium", availability: 10 },
  },
  {
    id: "12",
    name: "Zara Khan",
    role: "Cloud Architect",
    college: "Jamia Millia Islamia",
    bio: "Scalability is my middle name. AWS Community Builder.",
    techStack: ["AWS", "Serverless", "Azure", "Node.js"],
    achievements: ["AWS Community Builder Award"],
    avatarGradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    stats: { completionRate: 90, activityLevel: "High", availability: 22 },
  },
  {
    id: "13",
    name: "Kabir Singh",
    role: "Backend Heavy Lifter",
    college: "PEC",
    bio: "Rustacean. I care about memory safety and concurrency.",
    techStack: ["Rust", "Actix", "PostgreSQL", "Redis"],
    achievements: ["Contributed to Rust compiler"],
    avatarGradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    stats: { completionRate: 35, activityLevel: "Low", availability: 6 },
  },
  {
    id: "14",
    name: "Nikhil Chopra",
    role: "IoT Innovator",
    college: "Thapar University",
    bio: "Connecting hardware to the cloud. Arduino & Pi enthusiast.",
    techStack: ["C++", "MQTT", "Arduino", "Python"],
    achievements: ["Winner of Hardware Hackathon"],
    avatarGradient: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)",
    stats: { completionRate: 65, activityLevel: "Medium", availability: 14 },
  },
  {
    id: "15",
    name: "Riya Kapoor",
    role: "QA Engineer",
    college: "Amity University",
    bio: "I hate bugs more than I love coffee. Selenium expert.",
    techStack: ["Selenium", "Cypress", "Java", "JUnit"],
    achievements: ["Found 50+ bugs in beta"],
    avatarGradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    stats: { completionRate: 94, activityLevel: "High", availability: 20 },
  },
  {
    id: "16",
    name: "Vikram Sethi",
    role: "AR/VR Developer",
    college: "SRM University",
    bio: "Merging physical and digital worlds with Meta Quest.",
    techStack: ["Unity", "C#", "WebXR", "Three.js"],
    achievements: ["Hackathon winner for Best AR"],
    avatarGradient: "linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)",
    stats: { completionRate: 50, activityLevel: "Medium", availability: 8 },
  },
  {
    id: "17",
    name: "Sana Mir",
    role: "Fintech Specialist",
    college: "Kashmir University",
    bio: "Building the future of finance. Secure transactions & APIs.",
    techStack: ["Java", "Spring Boot", "Kafka", "Oracle"],
    achievements: ["Built UPI payment gateway"],
    avatarGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    stats: { completionRate: 89, activityLevel: "High", availability: 25 },
  },
  {
    id: "18",
    name: "Rahul Verma",
    role: "SysAdmin",
    college: "VIT Vellore",
    bio: "Linux is my home. I ensure 99.99% uptime.",
    techStack: ["Linux", "Bash", "Ansible", "Nginx"],
    achievements: ["Red Hat Certified Engineer"],
    avatarGradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    stats: { completionRate: 20, activityLevel: "Low", availability: 2 },
  },
  {
    id: "19",
    name: "Priya Das",
    role: "Frontend Dev",
    college: "Jadavpur University",
    bio: "Creative coder. I love Vue.js and Svelte animations.",
    techStack: ["Vue.js", "Svelte", "GSAP", "Nuxt"],
    achievements: ["Won Best UI at State Hackathon"],
    avatarGradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)",
    stats: { completionRate: 72, activityLevel: "Medium", availability: 12 },
  },
  {
    id: "20",
    name: "Amit Shah",
    role: "Backend Architect",
    college: "GTU",
    bio: "Scalable Java systems are my forte.",
    techStack: ["Java", "Spring", "Hibernate", "MySQL"],
    achievements: ["Oracle Certified Professional"],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    stats: { completionRate: 96, activityLevel: "High", availability: 28 },
  },
];

// --- MOCK INCOMING REQUESTS ---
const initialReceivedRequests: UserProfile[] = [
  {
    id: "req1",
    name: "Priya Das",
    role: "Frontend Developer",
    college: "Jadavpur University",
    bio: "Creative coder. I love Vue.js and Svelte.",
    techStack: ["Vue.js", "Svelte", "GSAP"],
    achievements: ["Best UI at State Hackathon"],
    avatarGradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)",
    stats: { completionRate: 72, activityLevel: "Medium", availability: 12 },
  },
  {
    id: "req2",
    name: "Amit Shah",
    role: "Backend Architect",
    college: "GTU",
    bio: "Scalable Java systems are my forte.",
    techStack: ["Java", "Spring", "Hibernate"],
    achievements: ["Oracle Certified"],
    avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    stats: { completionRate: 96, activityLevel: "High", availability: 28 },
  },
];

const upcomingHackathons = [
  { name: "Smart India Hackathon", date: "Nov 15", status: "Registering" },
  { name: "HackMIT 2025", date: "Dec 02", status: "Soon" },
  { name: "ETHGlobal Online", date: "Dec 10", status: "Open" },
];

const filters = ["All", "Frontend", "Backend", "AI/ML", "Design", "Web3"];

const Dashboard = () => {
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  // Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isCampusFilterActive, setIsCampusFilterActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Animation State
  const [exitDirection, setExitDirection] = useState<"left" | "right">("right");

  // Github State
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "connected"
  >("idle");
  const [userAvatar, setUserAvatar] = useState("");

  // --- MATCHING STATE ---
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<UserProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<UserProfile[]>(
    initialReceivedRequests
  );

  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  const myProfile = {
    name: userEmail ? userEmail.split("@")[0] : "Madhav Kalra",
    email: userEmail || "guest@example.com",
    role: "Full Stack Developer",
    college: "BPIT, GGSIPU",
    bio: "Passionate about building cool stuff.",
    techStack: ["React", "JavaScript", "Python"],
    stats: { swipes: 42, matches: 2, karma: 950 },
  };

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

  // --- 1. SWIPE HANDLER (SENDING REQUESTS) ---
  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);

    // Get the user being swiped on
    const currentUser = users[0];

    setTimeout(() => {
      if (users.length > 0) {
        // Remove from stack
        setUsers((prev) => prev.slice(1));

        // LOGIC: If swiped right, add to Sent Requests
        if (direction === "right" && currentUser) {
          setSentRequests((prev) => [currentUser, ...prev]);
        }
      }
    }, 200);
  };

  // --- 2. ACCEPT REQUEST HANDLER ---
  const handleAcceptRequest = (user: UserProfile) => {
    // Add to Matches
    setMatches((prev) => [user, ...prev]);
    // Remove from Received Requests
    setReceivedRequests((prev) => prev.filter((u) => u.id !== user.id));
  };

  // --- 3. DECLINE REQUEST HANDLER ---
  const handleDeclineRequest = (userId: string) => {
    setReceivedRequests((prev) => prev.filter((u) => u.id !== userId));
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

  const SidebarContent = () => (
    <>
      <Card
        className="p-4 border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group mb-6"
        onClick={() => setShowProfileModal(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage
                src={
                  userAvatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`
                }
                className="object-cover"
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
              Requests
            </div>
            <div className="font-bold text-sm">
              {receivedRequests.length + sentRequests.length}
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
              className="w-full h-8 text-xs border-none"
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
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => setSearchOpen(true)}
      />

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
                  <span className="hidden sm:inline">Requests</span>
                  {/* Badge for new requests */}
                  {(receivedRequests.length > 0 || sentRequests.length > 0) && (
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
              <div className="flex flex-col items-center w-full max-w-[340px] h-full z-20">
                <div className="relative w-full h-[500px] mb-6">
                  <AnimatePresence mode="popLayout" custom={exitDirection}>
                    {users
                      .slice(0, 3)
                      .map((user, index) => (
                        <SwipeCard
                          key={user.id}
                          user={user}
                          onSwipe={handleSwipe}
                          isTop={index === 0}
                          exitDirection={exitDirection}
                        />
                      ))
                      .reverse()}
                  </AnimatePresence>
                </div>

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

        {/* --- SLIDING SIDEBARS --- */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
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

      {/* --- MATCHES & REQUESTS SIDEBAR --- */}
      <MatchesSidebar
        matches={matches}
        receivedRequests={receivedRequests}
        sentRequests={sentRequests}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

      {/* Profile Modal */}
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
                      src={
                        userAvatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`
                      }
                      className="object-cover"
                    />
                    <AvatarFallback>{myProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setShowProfileModal(false);
                      navigate("/dashboard/settings");
                    }}
                  >
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

      {/* Github Modal */}
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
