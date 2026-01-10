import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "@/lib/api";
import {
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  Trophy,
  Loader2,
  CalendarDays,
  Radar,
  Zap,
  Globe,
  Terminal
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
  status: string;
  link: string;
  description: string;
}

// --- CONSTANTS ---
const CACHE_KEY = "hackathon_data";
const TIMESTAMP_KEY = "hackathon_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

export default function HackathonPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanned, setIsScanned] = useState(false); // New state to track if we have "scanned"
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  const navigate = useNavigate();

  // --- INITIAL CHECK (CACHE ONLY) ---
  useEffect(() => {
    // On load, we ONLY check cache. We do NOT hit API automatically.
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
    const now = Date.now();

    if (cachedData && cachedTime) {
      const age = now - parseInt(cachedTime);
      if (age < CACHE_DURATION) {
        // If we have fresh data, load it immediately (Free)
        setHackathons(JSON.parse(cachedData));
        setIsScanned(true); 
      }
    }
  }, []);

  // --- MANUAL SCAN HANDLER ---
  const handleScan = async () => {
    setLoading(true);
    
    try {
      // 1. Double check cache just in case (e.g. user clicked refresh quickly)
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
      const now = Date.now();

      if (cachedData && cachedTime) {
        const age = now - parseInt(cachedTime);
        if (age < CACHE_DURATION) {
          console.log("⚡ Cache Valid. Restoring data.");
          setHackathons(JSON.parse(cachedData));
          setIsScanned(true);
          setLoading(false);
          toast.success("Data restored from local cache.");
          return;
        }
      }

      console.log("📡 Initializing AI Scan...");

      // 2. ACTUAL API CALL
      const response = await fetch(`${API_BASE_URL}/api/live-hackathons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Connection Refused by Host");

      const data = await response.json();
      
      if (!Array.isArray(data)) throw new Error("Invalid Data Stream");

      setHackathons(data);
      setIsScanned(true);

      // 3. Update Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      
      toast.success("Scan Complete. Live events found.");

    } catch (err) {
      console.error("Scan Failed:", err);
      toast.error("Scan Failed. AI Systems Offline.");
    } finally {
      setLoading(false);
    }
  };

  // --- FORCE REFRESH (Bypasses Cache) ---
  const handleForceRefresh = async () => {
    localStorage.removeItem(CACHE_KEY); // Clear cache
    localStorage.removeItem(TIMESTAMP_KEY);
    handleScan(); // Run scan
  };

  // --- CALENDAR LOGIC ---
  const addToCalendar = async (hack: Hackathon) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar`, {
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
        toast.success("Event added to calendar");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Could not save to calendar");
    }
  };

  // --- FILTER LOGIC ---
  const filteredHackathons = hackathons.filter((hack) => {
    const title = hack.title?.toLowerCase() || "";
    const host = hack.host?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();
    const matchesSearch = title.includes(search) || host.includes(search);
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
          
          {/* --- HEADER --- */}
          <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                Hackathon Radar <Radar className="w-8 h-8 text-blue-500 animate-pulse" />
              </h1>
              <p className="text-muted-foreground text-lg">
                Global coding battlegrounds.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 border-white/10"
                onClick={() => navigate("/dashboard/calendar")}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar
              </Button>
            </div>
          </div>

          {/* --- EMPTY STATE / SCANNER (Visible if not scanned yet) --- */}
          {!isScanned && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500">
               <div className="relative mb-8 group cursor-pointer" onClick={handleScan}>
                 {/* Glowing Rings */}
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
                 <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                 <div className="absolute inset-4 border border-purple-500/30 rounded-full animate-[ping_3s_ease-in-out_infinite_delay-500ms]" />
                 
                 {/* Main Button Circle */}
                 <div className="w-32 h-32 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <Globe className="w-12 h-12 text-blue-400 group-hover:text-white transition-colors" />
                 </div>
               </div>
               
               <h2 className="text-2xl font-bold mb-2">Systems Ready</h2>
               <p className="text-muted-foreground text-center max-w-md mb-8">
                 Initialize the AI scanner to detect live hackathons across the internet.
                 Data will be cached for 24h to save resources.
               </p>

               <Button 
                size="lg" 
                onClick={handleScan}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 px-8 h-12 rounded-full font-bold tracking-wide"
               >
                 <Zap className="w-4 h-4 mr-2 fill-current" />
                 INITIALIZE SCAN
               </Button>
            </div>
          )}

          {/* --- LOADING STATE --- */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
              <div className="font-mono text-sm text-primary animate-pulse">
                &gt; ESTABLISHING UPLINK...
                <br/>
                &gt; PARSING GLOBAL FEEDS...
              </div>
            </div>
          )}

          {/* --- RESULTS (Visible only after scan) --- */}
          {isScanned && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Controls */}
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-8 sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b border-white/5">
                <div className="flex bg-muted/50 p-1 rounded-xl self-start">
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
                    placeholder="Filter results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50 h-10 w-full md:w-80 ml-auto"
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleForceRefresh}
                  title="Force Refresh (Uses AI)"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Radar className="w-4 h-4" />
                </Button>
              </div>

              {/* Grid */}
              {filteredHackathons.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No events found matching your filters.</p>
                  <Button variant="link" onClick={() => setActiveTab("All")} className="text-primary">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHackathons.map((hack) => (
                    <motion.div
                      key={hack.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="group relative h-full"
                    >
                      <Card className="h-full bg-black/40 backdrop-blur-md border-white/10 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300 shadow-xl">
                        <div
                          className={`h-1 w-full bg-gradient-to-r ${
                            hack.status.toLowerCase() === "live"
                              ? "from-red-500 to-orange-500"
                              : "from-blue-500 to-purple-500"
                          }`}
                        />
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <Badge
                              variant="outline"
                              className={`capitalize border-0 ${
                                hack.status.toLowerCase() === "live"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-blue-500/10 text-blue-500"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                hack.status.toLowerCase() === "live" ? "bg-red-500 animate-pulse" : "bg-blue-500"
                              }`}/>
                              {hack.status}
                            </Badge>
                          </div>
                          
                          <div className="mb-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1">
                             <Terminal className="w-3 h-3" /> {hack.host}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight text-white group-hover:text-primary transition-colors">
                            {hack.title}
                          </h3>
                          
                          <div className="space-y-2.5 text-xs text-muted-foreground mb-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary/70" />
                              {hack.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                              <span className="text-white/90 font-medium">{hack.prize}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              {hack.dates}
                            </div>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[10px] text-muted-foreground font-mono">
                             ID: {String(hack.id || "").substring(0, 6)}
                             </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-white/10 text-xs h-8"
                              onClick={() => setSelectedHackathon(hack)}
                            >
                              Details <ExternalLink className="ml-1 w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- DIALOG --- */}
      <Dialog
        open={!!selectedHackathon}
        onOpenChange={() => setSelectedHackathon(null)}
      >
        <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border-white/10 text-white">
          {selectedHackathon && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-white/10">{selectedHackathon.status}</Badge>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {selectedHackathon.host}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  {selectedHackathon.title}
                </DialogTitle>
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 leading-relaxed">
                  {selectedHackathon.description}
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                    Timeline
                  </div>
                  <div className="font-semibold text-sm">
                    {getDuration(selectedHackathon.startDate, selectedHackathon.endDate)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                    Prize Pool
                  </div>
                  <div className="font-semibold text-sm truncate text-yellow-500">
                    {selectedHackathon.prize}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 hover:text-white"
                  onClick={() => addToCalendar(selectedHackathon!)}
                >
                  <CalendarDays className="mr-2 h-4 w-4" /> Save
                </Button>

                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold"
                  onClick={() => window.open(selectedHackathon!.link, "_blank")}
                >
                  Register <ExternalLink className="w-4 h-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}