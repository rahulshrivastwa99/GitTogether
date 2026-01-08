import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
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
  PanelRight,
  PanelRightClose,
} from "lucide-react";

// --- COMPONENTS ---
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MatchesSidebar } from "@/components/MatchesSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { UserSearch } from "@/components/UserSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- NEW FEATURES IMPORTS ---
import { MatchDialog } from "@/components/MatchDialog";
import { ChatInterface } from "@/components/ChatInterface";

import { useAuth } from "@/context/AuthContext";

// --- TYPES ---
export interface UserProfile {
  id: string;
  _id?: string;
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

export interface HackathonEvent {
  name: string;
  date: string;
  status: string;
}

const filters = ["All", "Frontend", "Backend", "AI/ML", "Design", "Web3"];

const Dashboard = () => {
  const { userEmail, token } = useAuth();

  // --- LAYOUT STATE ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchesSidebarOpen, setMatchesSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isCampusFilterActive, setIsCampusFilterActive] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right">("right");

  // --- FEATURE STATE ---
  const [matchPopupOpen, setMatchPopupOpen] = useState(false);
  const [lastMatchedUser, setLastMatchedUser] = useState<UserProfile | null>(
    null
  );
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(
    null
  );

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

  // --- 1. LOAD PROFILE ---
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

  // --- 2. SOCKET.IO REAL-TIME MATCH LISTENER ---
  useEffect(() => {
    if (!token) return;

    // Parse user ID from token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const myId = JSON.parse(window.atob(base64)).id;

    const socket = io("http://localhost:5000");
    socket.emit("join_room", myId);

    socket.on("match_found", (data) => {
      console.log("🔥 Real-time Match Found:", data);
      const matchedProfile: UserProfile = {
        id: data.id,
        _id: data.id,
        name: data.name,
        role: data.role || "Developer",
        avatarGradient: data.avatarGradient,
        college: data.college || "Hackathon Partner",
        bio: "",
        techStack: [],
        achievements: [],
        stats: {
          completionRate: 100,
          activityLevel: "High",
          availability: 100,
        },
      };
      setLastMatchedUser(matchedProfile);
      setMatchPopupOpen(true);
      setMatches((prev) => [matchedProfile, ...prev]);
    });

    return () => {
      socket.off("match_found");
    };
  }, [token]);

  // 2. Function to trigger the Chat Interface from the Popup
  const handleStartChatFromMatch = () => {
    if (lastMatchedUser) {
      setActiveChatUser(lastMatchedUser); // This opens the ChatInterface.tsx
      setMatchPopupOpen(false); // Closes the match popup
    }
  };

  // --- 3. FETCH USERS ---
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

      const mappedUsers = response.data.map((u: any) => ({
        id: u._id,
        name: u.name || "Anonymous Hacker",
        role: u.role || "Developer",
        college: u.college || "Unknown College",
        bio: u.bio || "Ready to code.",
        techStack: u.skills || [],
        achievements: [],
        avatarGradient:
          u.avatarGradient ||
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        stats: { completionRate: 80, activityLevel: "High", availability: 20 },
      }));

      setAllUsers(mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- 4. FETCH MATCHES ---
  const fetchMatches = useCallback(async () => {
    if (!token) return;
    try {
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
      console.log("Matches fetch skipped or failed");
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchMatches();
  }, [fetchUsers, fetchMatches]);

  // --- 5. FILTER LOGIC ---
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

  // --- 6. SWIPE HANDLER ---
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.match) {
        setLastMatchedUser(currentUser);
        setMatchPopupOpen(true);
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

  // Handler for MatchDialog "Send Message" button
  const handleStartChatFromPopup = () => {
    if (lastMatchedUser) {
      setActiveChatUser(lastMatchedUser);
      setMatchPopupOpen(false);
    }
  };

  // --- RIGHT SIDEBAR CONTENT ---
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

      <div className="mb-4">
        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Your Matches
        </h3>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.id || match._id}
                onClick={() => setActiveChatUser(match)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${match.name}`}
                  />
                  <AvatarFallback>{match.name[0]}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <div className="font-semibold text-sm truncate">
                    {match.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {match.role}
                  </div>
                </div>
                <MessageCircle className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground italic p-2 text-center border border-dashed rounded-lg">
              No matches yet. Start swiping!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/50">
        <div className="p-2 bg-muted/50 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Karma
          </div>
          <div className="font-bold text-sm">{myProfile.stats.karma}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Swipes
          </div>
          <div className="font-bold text-sm">{myProfile.stats.swipes}</div>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Requests
          </div>
          <div className="font-bold text-sm">
            {sentRequests.length + receivedRequests.length}
          </div>
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
              {rightSidebarOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

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

        <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-0">
          <UserSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            users={allUsers}
            onSelectUser={handleSelectUser}
          />
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
              <Button onClick={fetchUsers} variant="outline">
                Refresh
              </Button>
            </div>
          )}
        </div>

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
        onOpenChat={setActiveChatUser}
      />

      <MatchDialog
        isOpen={matchPopupOpen}
        onClose={() => setMatchPopupOpen(false)}
        matchedUser={lastMatchedUser}
        onStartChat={handleStartChatFromMatch} // 🔥 PASS THE NEW PROP HERE
        currentUserImage={
          userAvatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`
        }
      />

      {activeChatUser && (
        <ChatInterface
          isOpen={!!activeChatUser}
          onClose={() => setActiveChatUser(null)}
          partner={activeChatUser}
          currentUserImage={
            userAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${myProfile.name}`
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
