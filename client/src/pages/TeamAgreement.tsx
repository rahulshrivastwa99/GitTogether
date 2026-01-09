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

export default function TeamAgreement() {
  const { token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"SETUP" | "CONTRACT">("SETUP");
  const componentRef = useRef(null);

  // --- STATE FOR TEAM FORMATION (SETUP MODE) ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [hackathonName, setHackathonName] = useState("");

  // --- STATE FOR SHARED CONTRACT (CONTRACT MODE) ---
  const [teamData, setTeamData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // --- 1. INITIAL FETCH WITH NORMALIZATION ---
  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchStatus = async () => {
    try {
      console.log("🔍 Fetching team status...");
      const teamRes = await axios.get(`${API_BASE_URL}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 Team response:", teamRes.data);

      if (teamRes.data.found) {
        const rawTeam = teamRes.data.team;

        // 🔧 NORMALIZE: Map backend fields to frontend expectations
        const normalizedTeam = {
          ...rawTeam,
          name: rawTeam.teamName || rawTeam.name || "Unnamed Team", // Backend = teamName
        };

        // 🔧 ENSURE memberDetails exists & populate from members
        let memberDetails = normalizedTeam.agreement?.memberDetails || [];
        if (!memberDetails.length && normalizedTeam.members?.length) {
          memberDetails = normalizedTeam.members.map((member: any) => ({
            userId: member._id || member.id,
            name: member.name || "Unknown",
            role: member.role || "",
            hours: "",
            responsibility: "",
          }));
          normalizedTeam.agreement.memberDetails = memberDetails;
        }

        // Ensure agreement exists
        if (!normalizedTeam.agreement) {
          normalizedTeam.agreement = {
            memberDetails,
            signedMembers: [],
            ipRule: "joint",
            decisionRule: "majority",
            commitmentRule: "",
            status: "Draft",
          };
        }

        console.log("✅ Normalized team:", normalizedTeam);
        setTeamData(normalizedTeam);
        setViewState("CONTRACT");
      } else {
        // Fetch matches for setup mode
        const matchesRes = await axios.get(`${API_BASE_URL}/api/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(matchesRes.data);
        setViewState("SETUP");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error.response?.data || error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREATE TEAM - FIXED PAYLOAD ---
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
          teamName: newTeamName.trim(), // ✅ Backend expects teamName
          hackathonName: hackathonName.trim(), // ✅ Backend expects hackathonName
          memberIds: selectedMatches,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Auto-switch to contract view
      setTeamData(res.data.team);
      setViewState("CONTRACT");
      toast.success("Team formed! Contract ready.");
    } catch (err: any) {
      console.error("Create team error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SAVE CONTRACT UPDATES - FIXED ROUTE ---
  const saveContractChanges = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/team/${teamData._id}/contract`, // ✅ Fixed route with :teamId
        {
          ipRule: teamData.agreement.ipRule,
          decisionRule: teamData.agreement.decisionRule,
          commitmentRule: teamData.agreement.commitmentRule || "",
          memberDetails: teamData.agreement.memberDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Changes saved for everyone!");
    } catch (err: any) {
      console.error("Save error:", err.response?.data);
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // --- 4. SIGN CONTRACT - FIXED ROUTE ---
  const handleSign = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/team/${teamData._id}/sign`, // ✅ Fixed route with :teamId
        {}, // No body needed
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTeamData(res.data.team);
      toast.success("You signed the contract! 🖋️");
    } catch (err: any) {
      console.error("Sign error:", err.response?.data);
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

      // Reset completely
      setTeamData(null);
      setSelectedMatches([]);
      setNewTeamName("");
      setHackathonName("");
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

  // Helper: Update member detail row
  const updateMemberDetail = (index: number, field: string, value: string) => {
    if (!teamData?.agreement?.memberDetails) return;

    const updatedDetails = [...teamData.agreement.memberDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };

    setTeamData({
      ...teamData,
      agreement: {
        ...teamData.agreement,
        memberDetails: updatedDetails,
      },
    });
  };

  // 🔧 Parse JWT helper (moved up for use in signatures)
  const parseJwt = (token: string | null) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(
            (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const userId = parseJwt(token)?.id;

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
          {/* --- VIEW 1: TEAM FORMATION (SETUP) --- */}
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
                              onClick={() => {
                                setSelectedMatches((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((mid) => mid !== id)
                                    : [...prev, id]
                                );
                              }}
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

          {/* --- VIEW 2: SHARED CONTRACT --- */}
          {viewState === "CONTRACT" && teamData && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-primary" /> Team Agreement:{" "}
                    {teamData.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Shared document. Changes reflect for everyone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveTeam}
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Leave Team
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
                    Save Changes
                  </Button>
                  <Button onClick={() => window.print()} variant="ghost">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Card className="min-h-[600px] border-border shadow-xl bg-card flex flex-col">
                <div className="p-8 space-y-8 flex-1">
                  {/* RESPONSIBILITIES TABLE */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <Briefcase className="w-5 h-5 text-blue-500" /> Member
                      Responsibilities
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 bg-muted/50 p-3 text-xs font-bold uppercase border-b tracking-wide">
                        <div className="col-span-3">Member</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Hours</div>
                        <div className="col-span-5">Responsibility</div>
                      </div>
                      {teamData.agreement.memberDetails?.map(
                        (m: any, i: number) => (
                          <div
                            key={i}
                            className="grid grid-cols-12 p-3 border-b last:border-b-0 items-center gap-2 hover:bg-muted/20"
                          >
                            <div className="col-span-3 text-sm font-medium pl-2">
                              {m.name || `Member ${i + 1}`}
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={m.role || ""}
                                onChange={(e) =>
                                  updateMemberDetail(i, "role", e.target.value)
                                }
                                className="h-9 text-sm"
                                placeholder="e.g. Frontend"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={m.hours || ""}
                                onChange={(e) =>
                                  updateMemberDetail(i, "hours", e.target.value)
                                }
                                className="h-9 text-sm"
                                placeholder="e.g. 20"
                              />
                            </div>
                            <div className="col-span-5">
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
                      ) || (
                        <div className="p-8 text-center text-muted-foreground">
                          No members loaded. Refresh page.
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* OPERATIONAL RULES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>IP Ownership</Label>
                      <Select
                        value={teamData.agreement.ipRule || "joint"}
                        onValueChange={(v) =>
                          setTeamData({
                            ...teamData,
                            agreement: { ...teamData.agreement, ipRule: v },
                          })
                        }
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
                        value={teamData.agreement.decisionRule || "majority"}
                        onValueChange={(v) =>
                          setTeamData({
                            ...teamData,
                            agreement: {
                              ...teamData.agreement,
                              decisionRule: v,
                            },
                          })
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
                          teamData.agreement.signedMembers?.some(
                            (signedId: any) =>
                              signedId.toString() === memberId.toString()
                          );
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
                      }) || []}
                    </div>
                  </div>
                </div>

                {/* SIGN BUTTON */}
                <div className="p-6 bg-muted/20 border-t flex justify-end gap-2">
                  {userId &&
                  teamData.agreement.signedMembers?.some(
                    (signedId: any) => signedId.toString() === userId
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
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
