import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { MatchesSidebar } from "@/components/MatchesSidebar";

const mockUsers = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Frontend Wizard",
    bio: "React pro who loves building beautiful UIs. Anime enthusiast and coffee addict. Let's build something amazing!",
    techStack: ["React", "TypeScript", "Tailwind"],
    avatarGradient: "linear-gradient(135deg, hsl(263, 70%, 50%) 0%, hsl(217, 91%, 50%) 100%)",
  },
  {
    id: "2",
    name: "Alex Rivera",
    role: "Backend Beast",
    bio: "Node.js & Python expert. ML hobbyist with a passion for scalable systems. Always down for a challenge!",
    techStack: ["Python", "Node.js", "ML"],
    avatarGradient: "linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(217, 91%, 50%) 100%)",
  },
  {
    id: "3",
    name: "Jordan Taylor",
    role: "Full Stack Dev",
    bio: "Jack of all trades, master of shipping fast. Love hackathons and late-night coding sessions.",
    techStack: ["React", "Go", "DevOps"],
    avatarGradient: "linear-gradient(135deg, hsl(0, 84%, 50%) 0%, hsl(38, 92%, 50%) 100%)",
  },
  {
    id: "4",
    name: "Sam Park",
    role: "Mobile Maverick",
    bio: "Flutter and React Native specialist. Building apps that people actually want to use.",
    techStack: ["Flutter", "Swift", "Firebase"],
    avatarGradient: "linear-gradient(135deg, hsl(45, 93%, 47%) 0%, hsl(263, 70%, 50%) 100%)",
  },
];

const mockMatches = [
  { id: "m1", name: "Sarah Chen", role: "Frontend Wizard", online: true },
  { id: "m2", name: "Alex Rivera", role: "Backend Beast", online: false },
];

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [matches] = useState(mockMatches);

  const handleSwipe = (direction: "left" | "right") => {
    if (users.length === 0) return;
    
    // Remove the top card
    setUsers(prev => prev.slice(1));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 glass border-b flex items-center justify-between px-6"
        >
          <h1 className="text-xl font-bold text-foreground">Find Your Match</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMatchesSidebarOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Matches</span>
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {matches.length}
              </span>
            )}
          </motion.button>
        </motion.header>

        {/* Swipe area */}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
          {users.length > 0 ? (
            <>
              <div className="relative h-[500px] w-full max-w-sm">
                <AnimatePresence>
                  {users.slice(0, 3).map((user, index) => (
                    <SwipeCard
                      key={user.id}
                      user={user}
                      onSwipe={handleSwipe}
                      isTop={index === 0}
                    />
                  )).reverse()}
                </AnimatePresence>
              </div>

              <div className="mt-8">
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
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You've seen everyone!
              </h2>
              <p className="text-muted-foreground">
                Check back later for new hackers to match with.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <MatchesSidebar
        matches={matches}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        icebreaker="Ask Sarah about her React animation library project!"
      />
    </div>
  );
};

export default Dashboard;
