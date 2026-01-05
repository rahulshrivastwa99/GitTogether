import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, RefreshCw } from "lucide-react";

// Components
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { MatchesSidebar } from "@/components/MatchesSidebar";
import { UserSearch } from "@/components/UserSearch";
import { Button } from "@/components/ui/button";

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

// --- MOCK DATA (20 Users) ---
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Aarav Patel",
    role: "Frontend Architect",
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
  {
    id: "m2",
    name: "Ishita Verma",
    role: "Blockchain Developer",
    online: false,
  },
];

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);

  // Data State
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [matches] = useState(mockMatches);

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

  // Handlers
  const handleSwipe = (direction: "left" | "right") => {
    if (users.length > 0) {
      setUsers((prev) => prev.slice(1));
    }
  };

  const handleSelectUser = (userId: string) => {
    const selectedUser = mockUsers.find((u) => u.id === userId);
    if (selectedUser) {
      setUsers([selectedUser]); // Filter to show only the selected user
      setSearchOpen(false); // Close search window
    }
  };

  const handleReset = () => {
    setUsers(mockUsers); // Reset to show all users again
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* 1. SIDEBAR (With Search Button Connected) */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => setSearchOpen(true)} // <-- This makes the button work
      />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 glass border-b flex items-center justify-between px-6 z-10"
        >
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Find Your Match
          </h1>
          <Button
            variant="secondary"
            className="relative gap-2 rounded-xl"
            onClick={() => setMatchesSidebarOpen(true)}
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="hidden sm:inline font-medium">Matches</span>
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-bounce">
                {matches.length}
              </span>
            )}
          </Button>
        </motion.header>

        {/* Swipe/Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          {/* SEARCH POPUP WINDOW */}
          <UserSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            users={mockUsers}
            onSelectUser={handleSelectUser}
          />

          {users.length > 0 ? (
            <>
              <div className="relative h-[550px] w-full max-w-sm mt-4 perspective-1000">
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

              <div className="mt-8 z-10">
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
              className="text-center p-8 max-w-md"
            >
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center animate-pulse">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">You've seen everyone!</h2>
              <p className="text-muted-foreground mb-6">
                That's all the developers we have for now. Check back later!
              </p>
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Start Over
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR (Matches & Chat) */}
      <MatchesSidebar
        matches={matches}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        icebreaker="Ask about their favorite tech stack!"
      />
    </div>
  );
};

export default Dashboard;
