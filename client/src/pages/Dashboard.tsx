import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle,
  Filter,
  Zap,
  Loader2,
  X,
  MapPin,
  PanelRight,
  PanelRightClose,
  BellRing,
  Github, // Restored
  Check, // Restored
} from "lucide-react";

// --- COMPONENTS ---
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MatchesSidebar } from "@/components/MatchesSidebar";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeControls } from "@/components/SwipeControls";
import { UserSearch } from "@/components/UserSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Restored
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

  // --- NOTIFICATION STATE (From Code 2) ---
  const [notification, setNotification] = useState<{
    senderId: string;
    senderName: string;
    content: string;
  } | null>(null);

  // --- GITHUB STATE (Restored from Code 1) ---
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "connected"
  >("idle");

  // --- DATA STATE ---
  const [userAvatar, setUserAvatar] = useState("");
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<UserProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<UserProfile[]>([]);

  // Restored Hackathon State (even if unused in UI currently)
  const [upcomingHackathons, setUpcomingHackathons] = useState<
    HackathonEvent[]
  >([]);

  const [loading, setLoading] = useState(true);

  // --- SOCKET REF (Optimized from Code 2) ---
  const socketRef = useRef<Socket | null>(null);

  const myProfile = {
    name:
      localStorage.getItem("userName") || userEmail?.split("@")[0] || "User",
    role: localStorage.getItem("userRole") || "Developer",
    college: localStorage.getItem("userCollege") || "Unknown College",
    email: userEmail,
    stats: { swipes: 42, matches: matches.length, karma: 950 },
  };

  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  // --- SOCKET.IO LISTENER ---
  useEffect(() => {
    if (!token) return;

    // Get My ID from Token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const myId = JSON.parse(window.atob(base64)).id;

    // Singleton Pattern for Socket (Prevents re-connection loops)
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }
    const socket = socketRef.current;

    socket.emit("join_room", myId);

    // MATCH LISTENER
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

    // GLOBAL MESSAGE LISTENER
    socket.on("receive_message", (msg) => {
      if (msg.sender === myId) return; // Don't notify if I sent it

      setNotification((prev) => {
        const sender = allUsers.find(
          (u) => u.id === msg.sender || u._id === msg.sender
        );
        const senderName = sender ? sender.name : "New Message";

        return {
          senderId: msg.sender,
          senderName: senderName,
          content: msg.content,
        };
      });
    });

    return () => {
      socket.off("match_found");
      socket.off("receive_message");
    };
  }, [token, allUsers]);

  // Handle Notification Click
  const handleNotificationClick = () => {
    if (notification) {
      const user = allUsers.find(
        (u) => u.id === notification.senderId || u._id === notification.senderId
      );
      if (user) {
        setActiveChatUser(user);
      }
      setNotification(null);
    }
  };

  // --- GITHUB HANDLER (Restored) ---
  const handleConfirmGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput) return;
    setGithubStatus("loading");

    // Simulating API call
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

  const handleStartChatFromMatch = () => {
    if (lastMatchedUser) {
      setActiveChatUser(lastMatchedUser);
      setMatchPopupOpen(false);
    }
  };

  // --- FETCH DATA ---
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

  // --- FILTER & SWIPE LOGIC ---
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

  const handleSwipe = async (direction: "left" | "right") => {
    setExitDirection(direction);
    const currentUser = users[0];
    if (!currentUser) return;

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

      {/* RESTORED: GitHub Connect Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mb-4 text-xs gap-2"
        onClick={() => setShowGithubModal(true)}
      >
        <Github className="w-3 h-3" />
        {githubStatus === "connected" ? "GitHub Connected" : "Connect GitHub"}
      </Button>

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
              onClick={() => setMatchesSidebarOpen(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Requests
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
        onStartChat={handleStartChatFromMatch}
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

      {/* RESTORED & REBUILT: GitHub Integration Modal */}
      <AnimatePresence>
        {showGithubModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md p-6 rounded-xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Github className="w-5 h-5" /> Import GitHub
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGithubModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleConfirmGithub} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    GitHub Profile URL
                  </label>
                  <Input
                    placeholder="https://github.com/username"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGithubModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={githubStatus === "loading"}>
                    {githubStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Verifying...
                      </>
                    ) : (
                      "Connect Profile"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL NOTIFICATION POPUP (From Code 2) */}
      <AnimatePresence>
        {notification &&
          (!activeChatUser || activeChatUser.id !== notification.senderId) && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              whileHover={{ y: -5 }}
              className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center gap-4 cursor-pointer z-[9999] border border-white/20"
              onClick={handleNotificationClick}
            >
              <div className="bg-white/20 p-2.5 rounded-2xl ring-2 ring-white/10 relative">
                <BellRing className="w-5 h-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-indigo-600" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-1">
                  New Message
                </p>
                <p className="text-sm font-bold tracking-tight truncate max-w-[200px]">
                  {notification.senderName}:{" "}
                  <span className="font-normal opacity-90">
                    {notification.content.substring(0, 20)}...
                  </span>
                </p>
              </div>
              <button
                className="ml-2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotification(null);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
