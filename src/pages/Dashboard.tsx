import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

// --- FIXED IMPORTS ---
// Ensure these paths match where your files actually are
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MatchesSidebar } from "@/components/MatchesSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { UserSearch } from "@/components/UserSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/context/AuthContext";

// --- TYPES ---
export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  role: string;
  bio: string;
  techStack: string[];
  skills: string[];
  achievements: string[];
  avatarGradient: string;
  college: string;
  stats: {
    completionRate: number;
    activityLevel: "High" | "Medium" | "Low";
    availability: number;
  };
}

export interface HackathonEvent {
  name: string;
  date: string;
  status: string;
}

const filters = ["All", "Frontend", "Backend", "AI/ML", "Design", "Web3"];

const Dashboard = () => {
  const { userEmail, token } = useAuth();
  const navigate = useNavigate();

  // --- LAYOUT STATE ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isCampusFilterActive, setIsCampusFilterActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right">("right");

  // --- GITHUB STATE ---
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "connected"
  >("idle");
  const [userAvatar, setUserAvatar] = useState("");

  // --- DATA STATE ---
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<UserProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<UserProfile[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<
    HackathonEvent[]
  >([]);
  const [loading, setLoading] = useState(true);

  // --- 🔥 1. LOAD PROFILE (FIXES ANONYMOUS ISSUE) ---
  // We read from localStorage because the Login API saved it there
  const myProfile = {
    name:
      localStorage.getItem("userName") || userEmail?.split("@")[0] || "User",
    role: localStorage.getItem("userRole") || "Developer",
    college: localStorage.getItem("userCollege") || "Unknown College",
    email: userEmail,
    bio: "Ready to hack!",
    techStack: ["React", "JavaScript", "Python"],
    stats: { swipes: 42, matches: matches.length, karma: 950 },
  };

  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  // --- 2. FETCH USERS (FEED) ---
  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 CRITICAL FIX: MAP DB DATA (skills) TO UI DATA (techStack)
      const mappedUsers = response.data.map((u: any) => ({
        id: u._id, // Map MongoDB _id to id
        name: u.name || "Anonymous Hacker",
        role: u.role || "Developer",
        college: u.college || "Unknown College",
        bio: u.bio || "Ready to code.",
        techStack: u.skills || [], // Fixes "join of undefined" crash
        achievements: [],
        avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        stats: {
          completionRate: 80,
          activityLevel: "High",
          availability: 20,
        },
      }));

      setAllUsers(mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- 3. FETCH MATCHES (SIDEBAR) ---
  const fetchMatches = useCallback(async () => {
    if (!token) return;
    try {
      // NOTE: Ensure your backend has the /api/matches route!
      const response = await axios.get("http://localhost:5000/api/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedMatches = response.data.map((u: any) => ({
        id: u._id,
        name: u.name,
        role: u.role,
        college: u.college,
        bio: u.bio,
        techStack: u.skills || [],
        avatarGradient:
          u.avatarGradient ||
          "linear-gradient(135deg, #FF6B6B 0%, #556270 100%)",
      }));

      setMatches(mappedMatches);
    } catch (error) {
      // Silent fail if route doesn't exist yet
      console.log("Matches fetch skipped or failed");
    }
  }, [token]);

  // Initial Data Load
  useEffect(() => {
    fetchUsers();
    fetchMatches();
  }, [fetchUsers, fetchMatches]);

  // --- 4. FILTER LOGIC ---
  useEffect(() => {
    let filtered = allUsers;

    if (activeFilter !== "All") {
      filtered = filtered.filter((user) => {
        const roleMatch = user.role
          ?.toLowerCase()
          .includes(activeFilter.toLowerCase());
        const techMatch = user.techStack?.some((tech) =>
          tech.toLowerCase().includes(activeFilter.toLowerCase())
        );
        return roleMatch || techMatch;
      });
    }

    if (isCampusFilterActive) {
      filtered = filtered.filter((user) =>
        user.college?.toLowerCase().includes(myProfile.college.toLowerCase())
      );
    }

    setUsers(filtered);
  }, [activeFilter, isCampusFilterActive, allUsers, myProfile.college]);

  // --- 5. SWIPE HANDLER ---
  const handleSwipe = async (direction: "left" | "right") => {
    setExitDirection(direction);
    const currentUser = users[0];

    if (!currentUser) return;

    // Optimistic UI Update
    setTimeout(() => {
      setUsers((prev) => prev.slice(1));
    }, 200);

    if (direction === "left") return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/swipe",
        {
          targetUserId: currentUser.id || currentUser._id,
          direction,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.match) {
        alert(`🔥 IT'S A MATCH! You and ${currentUser.name} are connected.`);
        setMatches((prev) => [currentUser, ...prev]);
      } else {
        setSentRequests((prev) => [...prev, currentUser]);
      }
    } catch (error) {
      console.error("Swipe API failed:", error);
    }
  };

  const handleAcceptRequest = (user: UserProfile) => {
    setMatches((prev) => [user, ...prev]);
    setReceivedRequests((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDeclineRequest = (userId: string) => {
    setReceivedRequests((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSelectUser = (userId: string) => {
    const selectedUser = allUsers.find(
      (u) => u.id === userId || u._id === userId
    );
    if (selectedUser) {
      setUsers([selectedUser]);
      setSearchOpen(false);
    }
  };

  const handleConfirmGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput) return;
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
      setShowGithubModal(false);
    }, 1500);
  };

  const SidebarContent = () => (
    <Card className="p-4 border-border/50 bg-card/50 mb-6">
      <div className="flex items-center gap-3 mb-4">
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
          <h3 className="font-bold text-sm text-foreground">
            {myProfile.name}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{myProfile.college}</span>
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
          <div className="font-bold text-sm text-primary">{matches.length}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Karma
          </div>
          <div className="font-bold text-sm">{myProfile.stats.karma}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => setSearchOpen(true)}
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* HEADER */}
        <div className="p-6 z-10 flex flex-col md:flex-row justify-between items-center gap-4">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCampusFilterActive(!isCampusFilterActive)}
              className={
                isCampusFilterActive
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                  : ""
              }
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isCampusFilterActive ? "My Campus" : "All Locations"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMatchesSidebarOpen(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Requests
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="px-6 pb-2 overflow-x-auto flex gap-2 scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-dashed"
          >
            <Filter className="w-3 h-3 mr-2" /> Filters
          </Button>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* MAIN DECK AREA */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-0">
          <UserSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            users={allUsers}
            onSelectUser={handleSelectUser}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center z-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Finding teammates...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="flex flex-col items-center w-full max-w-[340px] h-full z-20">
              <div className="relative w-full h-[500px] mb-6">
                <AnimatePresence mode="popLayout" custom={exitDirection}>
                  {users
                    .slice(0, 3)
                    .map((user, index) => (
                      <SwipeCard
                        key={user.id || user._id}
                        user={user}
                        onSwipe={handleSwipe}
                        isTop={index === 0}
                        exitDirection={exitDirection}
                      />
                    ))
                    .reverse()}
                </AnimatePresence>
              </div>
              <SwipeControls
                onPass={() => handleSwipe("left")}
                onConnect={() => handleSwipe("right")}
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md z-20">
              <h2 className="text-2xl font-bold mb-2">No profiles found!</h2>
              <p className="text-muted-foreground mb-6">
                Try changing your filters or inviting more friends.
              </p>
              <Button onClick={fetchUsers} variant="outline">
                Refresh
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
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
                className="fixed right-0 top-0 h-full w-[350px] bg-background border-l border-border z-50 p-6 shadow-2xl overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
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

                {/* Hackathons Widget */}
                <div className="mb-6">
                  <h3 className="font-bold text-xs flex items-center gap-2 text-muted-foreground uppercase tracking-wider mb-3">
                    <Calendar className="w-3 h-3" /> Upcoming Hackathons
                  </h3>
                  {upcomingHackathons.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-2">
                      No upcoming hackathons loaded.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingHackathons.map((hack, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/20"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs font-bold text-primary">
                            {hack.date.split(" ")[1]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {hack.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hack.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GitHub Boost Widget */}
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
                        className="w-full h-8 text-xs"
                        onClick={() => setShowGithubModal(true)}
                      >
                        Connect GitHub
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      <MatchesSidebar
        matches={matches}
        receivedRequests={receivedRequests}
        sentRequests={sentRequests}
        isOpen={matchesSidebarOpen}
        onClose={() => setMatchesSidebarOpen(false)}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

      {/* GITHUB MODAL */}
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
