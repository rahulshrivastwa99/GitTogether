import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calculator,
  Shield,
  Lightbulb,
  Clock,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Ensure you have this or use standard <select>

// --- TYPES ---
interface TeamMember {
  id: string;
  name: string;
  role: string;
  equity: number;
  // New fields for Smart Calculation
  hours: number;
  isIdeaOwner: boolean;
  roleType: "dev" | "design" | "business";
}

const EquityCalculator = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(true); // Default to Smart Mode

  // Form State
  const [projectName, setProjectName] = useState("Untitled Project");

  // Members State
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "You",
      role: "Full Stack Lead",
      equity: 50,
      hours: 40,
      isIdeaOwner: true,
      roleType: "dev",
    },
    {
      id: "2",
      name: "Teammate 1",
      role: "Frontend Dev",
      equity: 50,
      hours: 20,
      isIdeaOwner: false,
      roleType: "dev",
    },
  ]);

  // --- SMART CALCULATION LOGIC ---
  useEffect(() => {
    if (isSmartMode) {
      calculateSmartEquity();
    }
  }, [
    JSON.stringify(
      members.map((m) => ({ h: m.hours, i: m.isIdeaOwner, r: m.roleType }))
    ),
  ]);

  const calculateSmartEquity = () => {
    // 1. Calculate Points
    let totalPoints = 0;
    const scoredMembers = members.map((m) => {
      let points = 0;

      // A. Time Contribution (Base)
      points += m.hours;

      // B. Role Multiplier (Devs usually get slight premium in hackathons due to demand)
      if (m.roleType === "dev") points *= 1.2;
      if (m.roleType === "design") points *= 1.1;

      // C. The "Idea" Bonus (Fixed point bonus)
      if (m.isIdeaOwner) points += 20;

      return { ...m, points };
    });

    totalPoints = scoredMembers.reduce((sum, m) => sum + m.points, 0);

    // 2. Distribute 100% based on points share
    if (totalPoints === 0) return;

    const newMembers = scoredMembers.map((m) => ({
      ...m,
      equity: Math.round((m.points / totalPoints) * 100),
    }));

    // 3. Fix Rounding Errors (Ensure sum is exactly 100)
    const currentSum = newMembers.reduce((sum, m) => sum + m.equity, 0);
    const diff = 100 - currentSum;
    if (diff !== 0 && newMembers.length > 0) {
      // Add remainder to the person with highest equity (usually the lead)
      newMembers.sort((a, b) => b.equity - a.equity);
      newMembers[0].equity += diff;
    }

    // Only update if values actually changed to prevent infinite loops
    // (We rely on the useEffect dependency array for this usually, but setting state directly is fine here)
    setMembers(newMembers);
  };

  // --- HANDLERS ---
  const addMember = () => {
    if (members.length >= 5) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setMembers([
      ...members,
      {
        id: newId,
        name: "New Member",
        role: "Role",
        equity: 0,
        hours: 10,
        isIdeaOwner: false,
        roleType: "dev",
      },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof TeamMember, value: any) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Calculate Total Equity for Validation
  const totalEquity = members.reduce((sum, m) => sum + m.equity, 0);
  const isValid = totalEquity === 100;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Team Alliance Agreement
              </h1>
              <p className="text-muted-foreground">
                Fairly distribute ownership based on effort & skills.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card border px-3 py-2 rounded-lg">
                <Switch
                  checked={isSmartMode}
                  onCheckedChange={setIsSmartMode}
                  id="smart-mode"
                />
                <Label
                  htmlFor="smart-mode"
                  className="cursor-pointer font-medium flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-primary" />
                  Auto-Calculate
                </Label>
              </div>
              <Button
                onClick={() => window.print()}
                disabled={!isValid}
                className="gap-2"
              >
                <Download className="w-4 h-4" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* === LEFT COLUMN: THE INPUTS === */}
            <div className="space-y-6">
              {/* Project Name */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Label>Project Name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2 text-lg font-semibold"
                />
              </div>

              {/* Members Cards */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Team Members
                  </h2>
                  <Badge variant={isValid ? "default" : "destructive"}>
                    Total: {totalEquity}%
                  </Badge>
                </div>

                {members.map((member) => (
                  <motion.div
                    layout
                    key={member.id}
                    className={`p-4 rounded-xl border ${
                      member.isIdeaOwner
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30 border-border/50"
                    }`}
                  >
                    {/* Top Row: Name & Role */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          value={member.name}
                          onChange={(e) =>
                            updateMember(member.id, "name", e.target.value)
                          }
                          className="bg-background"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Role Title
                        </Label>
                        <Input
                          value={member.role}
                          onChange={(e) =>
                            updateMember(member.id, "role", e.target.value)
                          }
                          className="bg-background"
                        />
                      </div>
                      <div className="pt-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Middle Row: Smart Inputs (Only visible if Smart Mode is ON) */}
                    {isSmartMode && (
                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-background rounded-lg border border-border/50">
                        <div className="space-y-1.5">
                          <Label className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Hours/Week
                          </Label>
                          <Input
                            type="number"
                            value={member.hours}
                            onChange={(e) =>
                              updateMember(
                                member.id,
                                "hours",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs flex items-center gap-1 cursor-pointer">
                              <Lightbulb className="w-3 h-3" /> Original Idea?
                            </Label>
                            <Switch
                              checked={member.isIdeaOwner}
                              onCheckedChange={(c) =>
                                updateMember(member.id, "isIdeaOwner", c)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Role Type</Label>
                            <select
                              className="text-xs bg-transparent border-none outline-none font-medium text-right"
                              value={member.roleType}
                              onChange={(e) =>
                                updateMember(
                                  member.id,
                                  "roleType",
                                  e.target.value
                                )
                              }
                            >
                              <option value="dev">Dev</option>
                              <option value="design">Design</option>
                              <option value="business">Biz</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Equity Slider (Locked in Smart Mode, Active in Manual) */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Equity Share
                        </span>
                        <span className="font-bold text-primary">
                          {member.equity}%
                        </span>
                      </div>
                      <Slider
                        value={[member.equity]}
                        max={100}
                        step={1}
                        disabled={isSmartMode} // Disable manual sliding if Smart Mode is on
                        onValueChange={(val) =>
                          updateMember(member.id, "equity", val[0])
                        }
                        className={
                          isSmartMode ? "opacity-50 cursor-not-allowed" : ""
                        }
                      />
                    </div>
                  </motion.div>
                ))}

                <Button
                  variant="outline"
                  onClick={addMember}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Teammate
                </Button>
              </div>
            </div>

            {/* === RIGHT COLUMN: CONTRACT PREVIEW === */}
            <div className="relative hidden lg:block">
              <div className="sticky top-6">
                <div className="bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col font-serif">
                  {/* Paper Header */}
                  <div className="bg-slate-100 p-8 border-b border-slate-200 text-center">
                    <div className="flex justify-center mb-4">
                      <Shield className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-slate-800">
                      Operating Agreement
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                      Effective Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-10 flex-1 space-y-8">
                    <p className="text-sm leading-relaxed text-slate-700">
                      This agreement establishes the ownership structure for the
                      project known as
                      <strong className="text-black bg-yellow-100 px-1 mx-1">
                        {projectName}
                      </strong>
                      . The undersigned parties agree to distribute
                      equity/prizes based on the contributions outlined below.
                    </p>

                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b-2 border-slate-800">
                          <th className="pb-2 font-bold text-slate-900">
                            Team Member
                          </th>
                          <th className="pb-2 font-bold text-slate-900">
                            Role
                          </th>
                          <th className="pb-2 font-bold text-slate-900 text-right">
                            Ownership
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {members.map((m) => (
                          <tr key={m.id}>
                            <td className="py-3 font-medium text-slate-800">
                              {m.name}
                            </td>
                            <td className="py-3 text-slate-600 italic">
                              {m.role}
                            </td>
                            <td className="py-3 font-bold text-slate-900 text-right">
                              {m.equity}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Breakdown of WHY (Smart Mode Explanation) */}
                    {isSmartMode && (
                      <div className="bg-slate-50 p-4 rounded text-xs text-slate-500 border border-slate-200 italic">
                        * Calculation Basis: Contributions weighted by hours
                        committed ({members.reduce((a, b) => a + b.hours, 0)}{" "}
                        total weekly), role complexity, and intellectual
                        property origination.
                      </div>
                    )}

                    <div className="pt-12">
                      <p className="font-bold text-xs uppercase text-slate-400 mb-8">
                        Signatures
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                        {members.map((m) => (
                          <div key={m.id} className="relative">
                            <div className="absolute -top-6 left-0 font-handwriting text-2xl text-blue-900 transform -rotate-2">
                              {m.name}
                            </div>
                            <div className="h-px bg-slate-300 w-full mt-2"></div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-slate-400 uppercase">
                                Signed
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date().toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 text-center border-t border-slate-200 text-[10px] text-slate-400">
                    Generated securely via GitTogether
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EquityCalculator;
