import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
  Code,
  PenTool,
  Mic,
  BrainCircuit,
  Megaphone,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// --- TYPES ---
type RoleType =
  | "Frontend"
  | "Backend"
  | "AI/ML"
  | "Design"
  | "Product"
  | "Pitching";

interface TeamMember {
  id: number;
  name: string;
  role: RoleType;
}

// --- ANALYSIS LOGIC ---
const analyzeTeam = (members: TeamMember[]) => {
  const counts = {
    Frontend: 0,
    Backend: 0,
    "AI/ML": 0,
    Design: 0,
    Product: 0,
    Pitching: 0,
  };

  members.forEach((m) => counts[m.role]++);

  const techCount = counts.Frontend + counts.Backend + counts["AI/ML"];
  const designCount = counts.Design;
  const pitchCount = counts.Pitching + counts.Product;
  const total = members.length;

  let status: "Balanced" | "Warning" | "Critical" = "Balanced";
  let message = "Your team is perfectly optimized for the hackathon!";
  let missing: string[] = [];

  if (total === 0) {
    status = "Critical";
    message = "Your team is empty. Add members to start analysis.";
  } else if (pitchCount === 0) {
    status = "Critical";
    message = "No Presenter! You will build a great product but fail the demo.";
    missing.push("Pitcher/Product Manager");
  } else if (designCount === 0) {
    status = "Warning";
    message = "Missing Designer. Your UI might look engineered, not designed.";
    missing.push("UI/UX Designer");
  } else if (techCount === total) {
    status = "Warning";
    message = "Too many developers. Who is working on the pitch deck?";
    missing.push("Pitcher", "Designer");
  } else if (techCount === 0) {
    status = "Critical";
    message = "No Builders! You have ideas but no code.";
    missing.push("Developers");
  }

  return { status, message, counts, missing };
};

export default function TeamAnalysis() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initial Mock Team
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: "Madhav Kalra", role: "Frontend" },
    { id: 2, name: "Amit Shah", role: "Backend" },
  ]);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<RoleType>("Frontend");

  const analysis = analyzeTeam(members);

  const addMember = () => {
    if (!newName) return;
    setMembers([...members, { id: Date.now(), name: newName, role: newRole }]);
    setNewName("");
  };

  const removeMember = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case "Frontend":
      case "Backend":
        return <Code className="w-4 h-4" />;
      case "AI/ML":
        return <BrainCircuit className="w-4 h-4" />;
      case "Design":
        return <PenTool className="w-4 h-4" />;
      case "Pitching":
        return <Mic className="w-4 h-4" />;
      case "Product":
        return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 bg-muted/10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" /> Smart Team Balance
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered analysis to ensure you have all the skills needed to
              win.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: TEAM MANAGEMENT */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-border shadow-md">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Current Squad
                </h3>

                <div className="space-y-3 mb-6">
                  {members.map((member) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            member.role === "Design"
                              ? "bg-pink-500/10 text-pink-500"
                              : member.role === "Pitching"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <p className="font-bold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic border-2 border-dashed rounded-xl">
                      Add members to see analysis
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-end border-t pt-4">
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-semibold ml-1">
                      New Member Name
                    </span>
                    <Input
                      placeholder="e.g. Sarah Connor"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="w-[140px] space-y-2">
                    <span className="text-xs font-semibold ml-1">Role</span>
                    <Select
                      onValueChange={(v: RoleType) => setNewRole(v)}
                      defaultValue="Frontend"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="AI/ML">AI / ML</SelectItem>
                        <SelectItem value="Design">UI Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Pitching">Pitching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addMember} className="gap-2 bg-primary">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: AI ANALYSIS */}
            <div className="space-y-6">
              <Card
                className={`p-6 border-2 shadow-xl ${
                  analysis.status === "Balanced"
                    ? "border-green-500/50 bg-green-500/5"
                    : analysis.status === "Warning"
                    ? "border-yellow-500/50 bg-yellow-500/5"
                    : "border-red-500/50 bg-red-500/5"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {analysis.status === "Balanced" && (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  )}
                  {analysis.status === "Warning" && (
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  )}
                  {analysis.status === "Critical" && (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {analysis.status} Team
                    </h2>
                    <p className="text-xs opacity-80 font-medium">
                      AI Assessment
                    </p>
                  </div>
                </div>

                <p className="text-sm font-medium leading-relaxed mb-4">
                  {analysis.message}
                </p>

                {analysis.missing.length > 0 && (
                  <div className="bg-background/80 p-3 rounded-lg border border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Critical Gaps:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.missing.map((role) => (
                        <Badge
                          key={role}
                          variant="destructive"
                          className="text-[10px]"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* SKILL DISTRIBUTION */}
              <Card className="p-6">
                <h3 className="font-bold text-sm text-muted-foreground uppercase mb-4">
                  Skill Distribution
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Tech (Devs)</span>
                      <span>
                        {analysis.counts.Frontend +
                          analysis.counts.Backend +
                          analysis.counts["AI/ML"]}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((analysis.counts.Frontend +
                          analysis.counts.Backend +
                          analysis.counts["AI/ML"]) /
                          Math.max(members.length, 1)) *
                        100
                      }
                      className="h-2 bg-blue-100 dark:bg-blue-900"
                      indicatorColor="bg-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Design (UI/UX)</span>
                      <span>{analysis.counts.Design}</span>
                    </div>
                    <Progress
                      value={
                        (analysis.counts.Design / Math.max(members.length, 1)) *
                        100
                      }
                      className="h-2 bg-pink-100 dark:bg-pink-900"
                      indicatorColor="bg-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Pitching (Sales)</span>
                      <span>
                        {analysis.counts.Pitching + analysis.counts.Product}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((analysis.counts.Pitching + analysis.counts.Product) /
                          Math.max(members.length, 1)) *
                        100
                      }
                      className="h-2 bg-orange-100 dark:bg-orange-900"
                      indicatorColor="bg-orange-500"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
