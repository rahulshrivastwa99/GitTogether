import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Loader2,
  Trash2,
  Settings2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner"; // ✅ Added Toast
import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import API_BASE_URL from "@/lib/api";

// --- TYPES ---
interface Teammate {
  _id: string; // Ensure we have the ID for deletion
  id?: string;
  name: string;
  role: string;
  skills: string[];
}

export default function TeamAnalysis() {
  const { token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- TEAM STATE ---
  const [teamScore, setTeamScore] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [matches, setMatches] = useState<Teammate[]>([]);

  // --- MANAGE STATE ---
  const [isManaging, setIsManaging] = useState(false); // 🔥 Toggle for Delete Buttons

  // --- 1. FETCH & CALCULATE DATA ---
  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teammates: Teammate[] = res.data;
      setMatches(teammates);
      calculateStats(teammates);
    } catch (error) {
      console.error("Analysis Failed", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (teammates: Teammate[]) => {
    // 1. Define base stats
    const stats = {
      Frontend: 30,
      Backend: 20,
      Design: 10,
      DevOps: 10,
      AI: 10,
      Communication: 50,
    };

    // 2. Loop through matches and boost stats
    teammates.forEach((mate) => {
      const role = mate.role ? mate.role.toLowerCase() : "";
      const skills = mate.skills ? mate.skills.join(" ").toLowerCase() : "";

      if (role.includes("frontend") || skills.includes("react"))
        stats.Frontend += 30;
      if (role.includes("backend") || skills.includes("node"))
        stats.Backend += 30;
      if (role.includes("design") || skills.includes("figma"))
        stats.Design += 30;
      if (role.includes("devops") || skills.includes("aws")) stats.DevOps += 30;
      if (role.includes("ai") || skills.includes("python")) stats.AI += 30;
      stats.Communication += 10;
    });

    // 3. Normalize Data
    const finalData = Object.keys(stats).map((key) => ({
      subject: key,
      A: Math.min(stats[key as keyof typeof stats], 100),
      fullMark: 100,
    }));

    setChartData(finalData);
    const total = finalData.reduce((acc, curr) => acc + curr.A, 0);
    setTeamScore(Math.round(total / finalData.length));
  };

  // --- 2. HANDLE REMOVE TEAMMATE ---
  const handleRemoveMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this teammate?")) return;

    try {
      // Optimistic UI Update
      const updatedMatches = matches.filter((m) => (m._id || m.id) !== id);
      setMatches(updatedMatches);
      calculateStats(updatedMatches); // Recalculate graph immediately

      // Backend Call
      await axios.delete(`${API_BASE_URL}/api/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Teammate removed.");
    } catch (error) {
      console.error("Remove failed", error);
      toast.error("Failed to remove teammate.");
      fetchData(); // Revert on error
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              Team Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-driven insights on your squad's technical balance.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: CHART */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm h-[500px] relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
                  <h3 className="absolute top-6 left-6 font-bold text-lg">
                    Skill Distribution
                  </h3>

                  <div className="w-full h-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={chartData}
                      >
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Radar
                          name="Team Strength"
                          dataKey="A"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fill="#8b5cf6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* RIGHT: METRICS */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent shadow-md">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Squad Score
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-primary">
                      {teamScore}
                    </span>
                    <span className="text-xl text-muted-foreground mb-1">
                      / 100
                    </span>
                  </div>
                  <div className="mt-4">
                    {teamScore > 70 ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1">
                        <Zap className="w-4 h-4 mr-2" /> Hackathon Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 px-3 py-1">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Needs Balance
                      </Badge>
                    )}
                  </div>
                </Card>

                {/* 🔥 TEAM ROSTER WITH MANAGE BUTTON 🔥 */}
                <Card className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" /> Roster
                    </h3>
                    {matches.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsManaging(!isManaging)}
                        className={
                          isManaging
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        }
                      >
                        {isManaging ? "Done" : "Manage"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                      <span className="font-medium text-sm">You</span>
                      <Badge variant="outline" className="text-xs">
                        Owner
                      </Badge>
                    </div>

                    <AnimatePresence>
                      {matches.length > 0 ? (
                        matches.map((mate) => (
                          <motion.div
                            key={mate._id || mate.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {mate.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {mate.role}
                              </span>
                            </div>

                            {/* 🔥 DELETE BUTTON APPEARS IN EDIT MODE */}
                            {isManaging ? (
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleRemoveMember(mate._id || mate.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Settings2 className="w-4 h-4 text-muted-foreground opacity-50" />
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic text-center py-4">
                          No teammates yet.
                        </p>
                      )}
                    </AnimatePresence>
                  </div>

                  {matches.length === 0 && (
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => (window.location.href = "/dashboard")}
                    >
                      Find Teammates
                    </Button>
                  )}
                </Card>

                {/* Insights */}
                <Card className="p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Insights
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {chartData.find((d) => d.subject === "Backend")?.A < 50 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        <span>Weak Backend. Find a Node.js dev.</span>
                      </li>
                    )}
                    {teamScore > 60 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Good communication coverage.</span>
                      </li>
                    )}
                  </ul>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
