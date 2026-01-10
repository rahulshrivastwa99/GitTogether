import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ShieldCheck,
  Users,
  Check,
  Loader2,
  PenTool,
  Printer,
  ChevronRight,
  Gavel,
  Save,
  Briefcase,
  UserPlus,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/api";
import { socket } from "@/lib/socket"; // 🔌 IMPORT SOCKET

export default function TeamAgreement() {
  const { token, user } = useAuth(); // Assuming 'user' is available in context
  console.log("My User ID is:", user?.id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"SETUP" | "CONTRACT">("SETUP");

  // --- STATE FOR TEAM FORMATION ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [hackathonName, setHackathonName] = useState("");

  // --- STATE FOR SHARED CONTRACT ---
  const [teamData, setTeamData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // --- 1. SOCKET & INITIAL FETCH ---
  useEffect(() => {
    // Connect Socket on Mount
    socket.connect();

    // 👂 Listener: When someone saves the contract
    socket.on("contract_updated", (updatedTeam) => {
      console.log("🔔 Real-time Contract Update:", updatedTeam);

      // Merge updates carefully to avoid overwriting local edits while typing
      // For simplicity, we replace the whole object here
      setTeamData(updatedTeam);
      toast.info("Contract updated by a teammate.");
    });

    // 👂 Listener: When someone signs
    socket.on("member_signed", ({ userId, status }) => {
      // We can either refetch or wait for 'contract_updated'
      // Usually, the backend emits 'contract_updated' after a sign too.
      // If not, trigger a refetch:
      fetchStatus();
      toast.success("A member has signed!");
    });

    fetchStatus();

    // Cleanup on unmount
    return () => {
      socket.off("contract_updated");
      socket.off("member_signed");
      socket.disconnect();
    };
  }, [token]);

  const fetchStatus = async () => {
    try {
      const teamRes = await axios.get(`${API_BASE_URL}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (teamRes.data.found) {
        const rawTeam = teamRes.data.team;
        const normalizedTeam = normalizeTeamData(rawTeam);

        setTeamData(normalizedTeam);
        setViewState("CONTRACT");

        // 🔌 JOIN ROOM
        socket.emit("join_team", normalizedTeam._id);
      } else {
        const matchesRes = await axios.get(`${API_BASE_URL}/api/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(matchesRes.data);
        setViewState("SETUP");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize data structure
  const normalizeTeamData = (rawTeam: any) => {
    const normalized = {
      ...rawTeam,
      name: rawTeam.teamName || rawTeam.name || "Unnamed Team",
    };

    // Ensure agreement structure exists
    if (!normalized.agreement) {
      normalized.agreement = {
        memberDetails: [],
        signedMembers: [],
        ipRule: "joint",
        decisionRule: "majority",
        status: "Draft",
      };
    }

    // Populate member details if empty
    if (
      (!normalized.agreement.memberDetails ||
        normalized.agreement.memberDetails.length === 0) &&
      normalized.members
    ) {
      normalized.agreement.memberDetails = normalized.members.map((m: any) => ({
        userId: m._id || m.id,
        name: m.name,
        role: "",
        hours: "",
        responsibility: "",
      }));
    }

    return normalized;
  };

  // --- 2. CREATE TEAM ---
  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || selectedMatches.length === 0) {
      toast.warning("Name your team and select at least 1 member.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/team/create`,
        {
          teamName: newTeamName.trim(),
          hackathonName: hackathonName.trim(),
          memberIds: selectedMatches,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const normalized = normalizeTeamData(res.data.team);
      setTeamData(normalized);
      setViewState("CONTRACT");

      // 🔌 JOIN ROOM IMMEDIATELY
      socket.emit("join_team", normalized._id);

      toast.success("Team formed! Contract ready.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SAVE CONTRACT (AND BROADCAST) ---
  const saveContractChanges = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/team/contract`, // Backend will broadcast this change via Socket
        {
          teamId: teamData._id,
          ipRule: teamData.agreement.ipRule,
          decisionRule: teamData.agreement.decisionRule,
          commitmentRule: teamData.agreement.commitmentRule || "",
          memberDetails: teamData.agreement.memberDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optional: Update local state immediately (socket will also update it)
      // setTeamData(normalizeTeamData(res.data.team));

      toast.success("Changes saved & broadcasted to team!");
    } catch (err: any) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // --- 4. SIGN CONTRACT ---
  // --- 4. SIGN CONTRACT ---
  const handleSign = async () => {
    try {
      console.log("✍️ Signing team:", teamData._id); // Debug log

      // ✅ FIX: Use template literal to put ID inside the URL
      const res = await axios.post(
        `${API_BASE_URL}/api/team/${teamData._id}/sign`,
        {}, // Body is empty because ID is now in the URL
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic Update (Update UI immediately)
      const updatedSignedMembers = [...teamData.agreement.signedMembers];
      if (!updatedSignedMembers.includes(user?.id)) {
        updatedSignedMembers.push(user?.id);
      }

      setTeamData({
        ...teamData,
        agreement: {
          ...teamData.agreement,
          signedMembers: updatedSignedMembers,
        },
      });

      toast.success("You signed the contract! 🖋️");
    } catch (err: any) {
      console.error("Sign Error Details:", err.response); // Check browser console for real error
      toast.error(err.response?.data?.message || "Sign failed");
    }
  };

  // --- 5. LEAVE TEAM ---
  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure? This will remove you from the team.")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/team/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("You left the team.");

      // Reset
      setTeamData(null);
      setViewState("SETUP");

      // Refetch matches
      const matchesRes = await axios.get(`${API_BASE_URL}/api/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(matchesRes.data);
    } catch (error) {
      toast.error("Failed to leave team.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Local state update for inputs (before saving)
  const updateMemberDetail = (index: number, field: string, value: string) => {
    const updatedDetails = [...teamData.agreement.memberDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    setTeamData({
      ...teamData,
      agreement: { ...teamData.agreement, memberDetails: updatedDetails },
    });
  };

  // Helper: Local state update for Dropdowns
  const updateAgreementRule = (field: string, value: string) => {
    setTeamData({
      ...teamData,
      agreement: { ...teamData.agreement, [field]: value },
    });
  };

  // JWT Helper
  const parseJwt = (token: string | null) => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };
  const currentUserId = parseJwt(token)?.id;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-12 bg-muted/10">
        <div className="max-w-5xl mx-auto w-full">
          {/* --- SETUP MODE --- */}
          {viewState === "SETUP" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Assemble Your Squad</h1>
                <p className="text-muted-foreground">
                  Select matches to turn into an official team.
                </p>
              </div>

              <Card className="p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Team Name</Label>
                      <Input
                        placeholder="e.g. Code Ninjas"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hackathon</Label>
                      <Input
                        placeholder="e.g. HackMIT"
                        value={hackathonName}
                        onChange={(e) => setHackathonName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Select Teammates ({selectedMatches.length})</Label>
                    <div className="bg-muted/30 p-4 rounded-lg border space-y-2 max-h-60 overflow-y-auto">
                      {matches.length > 0 ? (
                        matches.map((m) => {
                          const id = m._id || m.id;
                          return (
                            <div
                              key={id}
                              className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                              onClick={() =>
                                setSelectedMatches((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((mid) => mid !== id)
                                    : [...prev, id]
                                )
                              }
                            >
                              <Checkbox
                                checked={selectedMatches.includes(id)}
                              />
                              <div className="flex-1">
                                <p className="font-bold text-sm">{m.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {m.role}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          No matches available. Go swipe first!
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateTeam}
                    className="w-full bg-primary"
                    disabled={loading || selectedMatches.length === 0}
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Form Team & Create
                    Contract
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* --- CONTRACT MODE --- */}
          {viewState === "CONTRACT" && teamData && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-primary" /> {teamData.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        teamData.agreement.status === "Signed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <p className="text-sm text-muted-foreground">
                      Status: {teamData.agreement.status}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveTeam}
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Leave
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveContractChanges}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save & Broadcast
                  </Button>
                  <Button onClick={() => window.print()} variant="ghost">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Card className="min-h-[600px] border-border shadow-xl bg-card flex flex-col">
                <div className="p-8 space-y-8 flex-1">
                  {/* MEMBER RESPONSIBILITIES */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <Briefcase className="w-5 h-5 text-blue-500" /> Member
                      Responsibilities
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 bg-muted/50 p-3 text-xs font-bold uppercase border-b tracking-wide">
                        <div className="col-span-3">Member</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-6">Responsibility</div>
                      </div>
                      {teamData.agreement.memberDetails?.map(
                        (m: any, i: number) => (
                          <div
                            key={i}
                            className="grid grid-cols-12 p-3 border-b last:border-b-0 items-center gap-2 hover:bg-muted/20"
                          >
                            <div className="col-span-3 text-sm font-medium pl-2">
                              {m.name || "Unknown"}
                            </div>
                            <div className="col-span-3">
                              <Input
                                value={m.role || ""}
                                onChange={(e) =>
                                  updateMemberDetail(i, "role", e.target.value)
                                }
                                className="h-9 text-sm"
                                placeholder="e.g. Frontend"
                              />
                            </div>
                            <div className="col-span-6">
                              <Input
                                value={m.responsibility || ""}
                                onChange={(e) =>
                                  updateMemberDetail(
                                    i,
                                    "responsibility",
                                    e.target.value
                                  )
                                }
                                className="h-9 text-sm"
                                placeholder="e.g. UI/UX Design"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* RULES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>IP Ownership</Label>
                      <Select
                        value={teamData.agreement.ipRule}
                        onValueChange={(v) => updateAgreementRule("ipRule", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opensource">
                            Open Source
                          </SelectItem>
                          <SelectItem value="joint">Joint Ownership</SelectItem>
                          <SelectItem value="leader">Leader Owned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Decision Making</Label>
                      <Select
                        value={teamData.agreement.decisionRule}
                        onValueChange={(v) =>
                          updateAgreementRule("decisionRule", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="majority">
                            Majority Vote
                          </SelectItem>
                          <SelectItem value="leader">Leader Decides</SelectItem>
                          <SelectItem value="consensus">Unanimous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* SIGNATURES */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <PenTool className="w-5 h-5 text-green-500" /> Signatures
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamData.members?.map((member: any) => {
                        const memberId = member._id || member.id || member;
                        const hasSigned =
                          teamData.agreement.signedMembers?.includes(memberId);

                        return (
                          <div
                            key={memberId}
                            className={`p-4 border rounded-lg flex items-center justify-between transition-all ${
                              hasSigned
                                ? "bg-green-500/10 border-green-500/30 shadow-md"
                                : "bg-muted/10 border-muted/30"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {hasSigned
                                  ? "✓ Signed Digitally"
                                  : "Pending Signature"}
                              </p>
                            </div>
                            {hasSigned && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="p-6 bg-muted/20 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                  {teamData.agreement.status === "Draft" &&
                    teamData.agreement.signedMembers.length > 0 && (
                      <div className="text-xs text-yellow-600 flex gap-2 items-center bg-yellow-100 p-2 rounded w-full md:w-auto">
                        <AlertCircle className="w-4 h-4" />
                        Warning: Editing rules now will reset everyone's
                        signatures!
                      </div>
                    )}

                  <div className="ml-auto">
                    {currentUserId &&
                    teamData.agreement.signedMembers?.includes(
                      currentUserId
                    ) ? (
                      <Button
                        disabled
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50"
                      >
                        <Check className="w-4 h-4 mr-2" /> You Signed
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSign}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        I Agree & Sign Contract
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
