import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Clock,
  Search,
  X,
  CalendarPlus, // New Icon
  ExternalLink,
  Sparkles,
  UserPlus, // New Icon
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Ensure this is imported

// --- MOCK HACKATHON DATA ---
const HACKATHONS = [
  {
    id: 1,
    title: "Innovators Hackathon 2026",
    organizer: "T-Hub & NMIET",
    status: "Live",
    date: "Jan 22 - Jan 23, 2026",
    mode: "Offline (Pune)",
    participants: "5000+",
    prizes: "₹10 Lakhs",
    tags: ["Robotics", "AI/ML", "Hardware"],
    gradient: "from-blue-600 to-indigo-600",
    desc: "A 48-hour non-stop innovation challenge to bridge the gap between academia and industry.",
    // New Data for Squad Matcher
    interestedUsers: [
      {
        name: "Rahul V.",
        role: "AI Engineer",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      },
      {
        name: "Sara K.",
        role: "Designer",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
      },
      {
        name: "Amit S.",
        role: "Backend",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
      },
    ],
  },
  {
    id: 2,
    title: "IIT Kanpur E-Summit '26",
    organizer: "IIT Kanpur E-Cell",
    status: "Live",
    date: "Jan 23 - Jan 25, 2026",
    mode: "Hybrid",
    participants: "15k+",
    prizes: "₹25 Lakhs",
    tags: ["FinTech", "Startup"],
    gradient: "from-orange-500 to-red-500",
    desc: "The flagship event of IIT Kanpur featuring multiple hackathons like 'BizEntangle'.",
    interestedUsers: [
      {
        name: "Priya M.",
        role: "Frontend",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      },
      {
        name: "Dev P.",
        role: "Full Stack",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev",
      },
    ],
  },
  // ... (Add 'interestedUsers' to other items similarly if you want, or leave undefined to test empty state)
  {
    id: 3,
    title: "HackWithInfy 2026",
    organizer: "Infosys",
    status: "Upcoming",
    date: "Registrations: Feb 2026",
    mode: "Online",
    participants: "1 Lakh+",
    prizes: "Job Offers",
    tags: ["Coding", "Hiring"],
    gradient: "from-pink-600 to-purple-600",
    desc: "Infosys's flagship coding competition for engineering students.",
    interestedUsers: [],
  },
  {
    id: 6,
    title: "Flipkart GRiD 8.0",
    organizer: "Flipkart",
    status: "Upcoming",
    date: "June 2026",
    mode: "Online",
    participants: "2 Lakh+",
    prizes: "₹5 Lakhs + Jobs",
    tags: ["E-Commerce", "GenAI"],
    gradient: "from-yellow-400 to-orange-500",
    desc: "India's biggest engineering campus challenge.",
    interestedUsers: [
      {
        name: "Arjun K.",
        role: "Data Scientist",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      },
      {
        name: "Neha S.",
        role: "Product",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
      },
      {
        name: "Rohan D.",
        role: "DevOps",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      },
      {
        name: "Kavya L.",
        role: "Mobile",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya",
      },
    ],
  },
  // Add remaining items from previous code...
];

type HackathonStatus = "All" | "Live" | "Upcoming" | "Past";

const HackathonPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<HackathonStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);

  const filteredHackathons = HACKATHONS.filter(
    (h) =>
      (activeTab === "All" || h.status === activeTab) &&
      h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans relative">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 overflow-y-auto h-screen">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-border/50 p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Hackathon Arena
                </h1>
                <p className="text-slate-300 text-lg max-w-xl">
                  Discover India's top coding battles. From SIH to Flipkart
                  GRiD, find your stage to shine.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-0 z-10 bg-background/95 backdrop-blur-md py-4 border-b border-border/40">
            <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
              {["All", "Live", "Upcoming", "Past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as HackathonStatus)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search hackathons..."
                className="pl-10 rounded-full bg-muted/30 border-transparent focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredHackathons.map((hack) => (
                <HackathonCard
                  key={hack.id}
                  data={hack}
                  onClick={() => setSelectedHackathon(hack)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* --- DETAILS MODAL WITH SQUAD MATCHER --- */}
      <AnimatePresence>
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHackathon(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Banner */}
              <div
                className={`h-40 bg-gradient-to-r ${selectedHackathon.gradient} p-8 flex items-end relative`}
              >
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <Badge className="mb-3 bg-black/40 backdrop-blur-md border-none text-white hover:bg-black/50">
                    {selectedHackathon.status}
                  </Badge>
                  <h2 className="text-3xl font-bold text-white shadow-sm">
                    {selectedHackathon.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto">
                {/* Key Info */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Organizer
                    </div>
                    <div className="font-semibold">
                      {selectedHackathon.organizer}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Prize Pool
                    </div>
                    <div className="font-semibold text-primary">
                      {selectedHackathon.prizes}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Mode
                    </div>
                    <div className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {selectedHackathon.mode}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Dates
                    </div>
                    <div className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {selectedHackathon.date}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> About Event
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedHackathon.desc}
                  </p>
                </div>

                {/* --- NEW FEATURE: SQUAD MATCHER --- */}
                <div className="mb-8 p-5 bg-secondary/30 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" /> Looking for
                      Team?
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {selectedHackathon.interestedUsers?.length || 0} active
                      users
                    </Badge>
                  </div>

                  {selectedHackathon.interestedUsers &&
                  selectedHackathon.interestedUsers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedHackathon.interestedUsers.map(
                        (user: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-background p-3 rounded-lg border border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.img} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-semibold">
                                  {user.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.role}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <UserPlus className="w-4 h-4 mr-1" /> Connect
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Be the first to look for a team here!
                    </div>
                  )}
                  <Button
                    className="w-full mt-4 bg-background border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 hover:text-primary text-muted-foreground"
                    variant="outline"
                  >
                    + List me as looking for team
                  </Button>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedHackathon.tags.map((t: string) => (
                      <Badge key={t} variant="secondary" className="px-3 py-1">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedHackathon(null)}
                >
                  Close
                </Button>
                <Button variant="outline" className="gap-2">
                  <CalendarPlus className="w-4 h-4" /> Add to Calendar
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Register Now <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CARD COMPONENT ---
const HackathonCard = ({
  data,
  onClick,
}: {
  data: any;
  onClick: () => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col h-full"
    >
      <div
        className={`h-32 bg-gradient-to-r ${data.gradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute top-4 right-4">
          {data.status === "Live" && (
            <Badge className="bg-red-500/90 hover:bg-red-500 border-none animate-pulse">
              Live
            </Badge>
          )}
          {data.status === "Upcoming" && (
            <Badge className="bg-blue-500/90 border-none">Upcoming</Badge>
          )}
          {data.status === "Past" && (
            <Badge
              variant="secondary"
              className="bg-black/50 border-none text-white"
            >
              Closed
            </Badge>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <div className="text-xs text-primary font-bold tracking-wide uppercase mb-1 opacity-80">
            {data.organizer}
          </div>
          <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {data.title}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" /> {data.mode}
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> {data.prizes}
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{data.date}</span>
          <Button
            size="sm"
            variant="ghost"
            className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent"
          >
            Details <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonPage;
