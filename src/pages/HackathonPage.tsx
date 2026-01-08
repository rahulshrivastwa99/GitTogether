import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  CalendarDays,
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
  status: string; // Changed from strict literal to handle AI variations
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
    description: "The world's largest open innovation model!",
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
      "Build a solution to a local problem using Google technologies.",
  },
];

export default function HackathonPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    null
  );

  const navigate = useNavigate();

  const fetchLiveHackathons = async () => {
    setLoading(true);
    setUsingBackup(false);
    try {
      const response = await fetch(
        "http://localhost:5000/api/live-hackathons",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Backend API Failed");

      const data = await response.json();
      setHackathons(data);
      console.log("✅ AI Hackathons loaded successfully:", data);
    } catch (err) {
      console.error("❌ AI Fetch failed, falling back to backup:", err);
      setHackathons(BACKUP_HACKATHONS);
      setUsingBackup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHackathons();
  }, []);

  // Inside HackathonPage.tsx
  const addToCalendar = async (hack: Hackathon) => {
    try {
      const response = await fetch("http://localhost:5000/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: hack.title,
          date: hack.dates,
          host: hack.host,
          location: hack.location,
          prize: hack.prize,
          description: hack.description,
          link: hack.link,
          note: "Saved from Arena",
        }),
      });
      if (response.ok) {
        alert("🚀 Added to your calendar!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Could not save to calendar.");
    }
  };

  // --- FILTER LOGIC (FIXED BLANK SCREEN ISSUE) ---
  const filteredHackathons = hackathons.filter((hack) => {
    // 1. Search Query Match
    const title = hack.title?.toLowerCase() || "";
    const host = hack.host?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();
    const matchesSearch = title.includes(search) || host.includes(search);

    // 2. Tab Match (Case-Insensitive & Trimmed)
    const hackStatus = hack.status?.trim().toLowerCase() || "";
    const currentTab = activeTab.toLowerCase();
    const matchesTab = activeTab === "All" || hackStatus === currentTab;

    return matchesSearch && matchesTab;
  });

  const getDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Check Details";
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
              {/* --- CORRECTED CALENDAR ROUTE --- */}
              <Button
                variant="default"
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
          ) : filteredHackathons.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-2xl">
              <p className="text-muted-foreground">
                No hackathons found in this category.
              </p>
              <Button variant="link" onClick={() => setActiveTab("All")}>
                View All Events
              </Button>
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
                  <Card className="h-full bg-card border-border/50 overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                    <div
                      className={`h-2 w-full bg-gradient-to-r ${
                        hack.status.toLowerCase() === "live"
                          ? "from-red-500 to-orange-500"
                          : "from-blue-500 to-purple-500"
                      }`}
                    />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            hack.status.toLowerCase() === "live"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {hack.status}
                        </Badge>
                      </div>
                      <div className="mb-1 text-xs font-bold text-primary uppercase tracking-widest">
                        {hack.host}
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 h-14">
                        {hack.title}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {hack.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          {hack.prize}
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {hack.dates}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
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

      <Dialog
        open={!!selectedHackathon}
        onOpenChange={() => setSelectedHackathon(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedHackathon && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedHackathon.status}</Badge>
                  <span className="text-xs text-muted-foreground uppercase">
                    {selectedHackathon.host}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold">
                  {selectedHackathon.title}
                </DialogTitle>
                <div className="mt-4 p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground">
                  {selectedHackathon.description}
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    Duration
                  </div>
                  <div className="font-semibold text-sm">
                    {getDuration(
                      selectedHackathon.startDate,
                      selectedHackathon.endDate
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    Prize
                  </div>
                  <div className="font-semibold text-sm truncate">
                    {selectedHackathon.prize}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => addToCalendar(selectedHackathon!)}
                >
                  <CalendarDays className="mr-2 h-4 w-4" /> Save to Calendar
                </Button>

                <Button
                  className="w-full gap-2 bg-primary"
                  onClick={() => window.open(selectedHackathon!.link, "_blank")}
                >
                  Register Now <ExternalLink className="w-4 h-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
