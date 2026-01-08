import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  Trophy,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  Globe,
  Users,
  BookOpen,
  Info,
  CalendarDays, // 2. Import Calendar icon for the button
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// --- INTERFACE ---
interface Hackathon {
  id: string;
  title: string;
  host: string;
  location: string;
  prize: string;
  dates: string;
  startDate: string;
  endDate: string;
  status: "Live" | "Upcoming";
  link: string;
  description: string;
}

// --- BACKUP DATA ---
const BACKUP_HACKATHONS: Hackathon[] = [
  {
    id: "m1",
    title: "Smart India Hackathon 2026",
    host: "Ministry of Education",
    location: "Nationwide",
    prize: "₹1 Crore Pool",
    dates: "Aug 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    status: "Upcoming",
    link: "https://sih.gov.in/",
    description:
      "The world's largest open innovation model! Smart India Hackathon 2026 invites students to solve some of the most pressing problems we face in our daily lives. Themes include Smart Automation, Heritage & Culture, and Clean Water.",
  },
  {
    id: "m2",
    title: "Flipkart GRiD 7.0",
    host: "Flipkart",
    location: "Online",
    prize: "₹1,50,000",
    dates: "July 2026",
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    status: "Upcoming",
    link: "https://unstop.com/",
    description:
      "Flipkart GRiD is our flagship engineering campus challenge. It provides you the opportunity to apply your technical knowledge to solve real world e-commerce problems. Winners get direct interviews for SDE roles!",
  },
  {
    id: "m3",
    title: "Google Solution Challenge",
    host: "Google",
    location: "Global",
    prize: "$3,000",
    dates: "Jan 2026",
    startDate: "2026-01-10",
    endDate: "2026-01-30",
    status: "Live",
    link: "https://developers.google.com/",
    description:
      "Build a solution to a local problem using Google technologies, in accordance with one or more of the United Nations 17 Sustainable Development Goals. The top 100 teams receive mentorship from Google experts.",
  },
  {
    id: "m4",
    title: "ETHIndia 2025",
    host: "Devfolio",
    location: "Bangalore",
    prize: "$50,000",
    dates: "Dec 2025",
    startDate: "2025-12-04",
    endDate: "2025-12-06",
    status: "Upcoming",
    link: "https://ethindia.co/",
    description:
      "Asia's biggest Ethereum hackathon. Join 2000+ builders for 3 days of hacking, learning, and networking. Whether you are a DeFi wizard or an NFT novice, there is a place for you here.",
  },
];

export default function HackathonPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);

  // 3. Initialize Navigation
  const navigate = useNavigate();

  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    null
  );

  const fetchLiveHackathons = async () => {
    setLoading(true);
    setUsingBackup(false);
    try {
      // PROXY FIX for CORS
      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const targetUrl = "https://kontests.net/api/v1/all";

      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

      if (!response.ok) throw new Error("API Failed");
      const data: any[] = await response.json();

      const relevantSites = [
        "HackerEarth",
        "HackerRank",
        "LeetCode",
        "CodeChef",
        "AtCoder",
      ];
      const liveData: Hackathon[] = data
        .filter((item) => relevantSites.includes(item.site))
        .map((item, index) => {
          const now = new Date();
          const start = new Date(item.start_time);
          const end = new Date(item.end_time);
          const isLive = now >= start && now <= end;

          return {
            id: `api-${index}`,
            title: item.name,
            host: item.site,
            location: "Online",
            prize: "See Details",
            dates: start.toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
            startDate: item.start_time,
            endDate: item.end_time,
            status: isLive ? "Live" : "Upcoming",
            link: item.url,
            description: `Join the ${item.name} hosted by ${item.site}. This is a competitive programming contest open to participants worldwide. Test your algorithmic skills and climb the leaderboard!`,
          };
        });

      if (liveData.length === 0) throw new Error("No data");
      setHackathons(liveData);
    } catch (err) {
      setHackathons(BACKUP_HACKATHONS);
      setUsingBackup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHackathons();
  }, []);

  const filteredHackathons = hackathons.filter((hack) => {
    const matchesSearch =
      hack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hack.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || hack.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1 ? `${diffDays} Days` : "24 Hours";
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Hackathon Arena
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover India's top coding battles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* --- 4. NEW CALENDAR BUTTON --- */}
              <Button
                variant="default" // Using default (solid color) to highlight it
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg shadow-purple-500/20"
                onClick={() => navigate("/dashboard/calendar")}
              >
                <CalendarDays className="w-4 h-4" />
                My Calendar
              </Button>

              <div className="h-6 w-[1px] bg-border mx-1 hidden md:block"></div>

              {usingBackup && (
                <Badge
                  variant="destructive"
                  className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                >
                  Offline Mode
                </Badge>
              )}
              <Button
                onClick={fetchLiveHackathons}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Syncing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {usingBackup && !loading && (
            <div className="max-w-5xl mx-auto mb-6">
              <Alert className="bg-orange-500/5 border-orange-500/20 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Feed Unavailable</AlertTitle>
                <AlertDescription>
                  Showing curated featured hackathons instead.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-8 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4">
            <div className="flex bg-muted/50 p-1 rounded-xl">
              {["All", "Live", "Upcoming"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50 h-10 w-full md:w-80 ml-auto"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground animate-pulse">
                Syncing hackathon data...
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHackathons.map((hack) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group relative h-full"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      hack.status === "Live"
                        ? "from-red-500 to-orange-500"
                        : "from-blue-500 to-purple-500"
                    } opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                  />

                  <Card className="h-full bg-card border-border/50 overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                    <div
                      className={`h-2 w-full bg-gradient-to-r ${
                        hack.status === "Live"
                          ? "from-red-500 to-orange-500"
                          : "from-blue-500 to-purple-500"
                      }`}
                    />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          variant="outline"
                          className={`border-none px-2 py-1 uppercase text-[10px] tracking-wider font-bold ${
                            hack.status === "Live"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {hack.status}
                        </Badge>
                        {hack.status === "Live" && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </div>

                      <div className="mb-1 text-xs font-bold text-primary uppercase tracking-widest opacity-80">
                        {hack.host}
                      </div>

                      <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors h-14">
                        {hack.title}
                      </h3>

                      <div className="space-y-2 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {hack.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="truncate">{hack.prize}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {hack.dates}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => setSelectedHackathon(hack)}
                        >
                          Details <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- THE DETAIL WINDOW BOX (MODAL) --- */}
      <Dialog
        open={!!selectedHackathon}
        onOpenChange={() => setSelectedHackathon(null)}
      >
        <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl">
          {selectedHackathon && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`${
                      selectedHackathon.status === "Live"
                        ? "text-red-500 border-red-500/20 bg-red-500/10"
                        : "text-blue-500 border-blue-500/20 bg-blue-500/10"
                    }`}
                  >
                    {selectedHackathon.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {selectedHackathon.host}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                  {selectedHackathon.title}
                </DialogTitle>

                <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs uppercase tracking-wider">
                    <Info className="w-4 h-4" /> About Event
                  </div>
                  {selectedHackathon.description}
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50 flex flex-col justify-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </div>
                  <div className="font-semibold text-sm">
                    {getDuration(
                      selectedHackathon.startDate,
                      selectedHackathon.endDate
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border/50 flex flex-col justify-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Prize
                  </div>
                  <div
                    className="font-semibold text-sm truncate"
                    title={selectedHackathon.prize}
                  >
                    {selectedHackathon.prize}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border/50 col-span-2 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Location
                    </div>
                    <div className="font-semibold text-sm">
                      {selectedHackathon.location}
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-border mx-4"></div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Team Size
                    </div>
                    <div className="font-semibold text-sm">1 - 4 Members</div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2">
                <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-primary">
                  <BookOpen className="w-4 h-4" /> Eligibility Criteria
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Open to all engineering students.</li>
                  <li>Must have a valid college ID card.</li>
                  <li>Both individual and team participation allowed.</li>
                </ul>
              </div>

              <DialogFooter className="sm:justify-start">
                <Button
                  className="w-full gap-2 text-lg font-bold h-12"
                  size="lg"
                  onClick={() => window.open(selectedHackathon.link, "_blank")}
                >
                  Register Now <ExternalLink className="w-5 h-5" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
