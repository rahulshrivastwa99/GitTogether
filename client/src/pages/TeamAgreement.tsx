import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
  Github,
  Sparkles,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // --- STATE FOR POPUPS ---
  const [teamFormedDialog, setTeamFormedDialog] = useState(false);
  const [teamFormedData, setTeamFormedData] = useState<any>(null);

  // --- 1. SOCKET & INITIAL FETCH ---
  useEffect(() => {
    // Connect Socket on Mount
    socket.connect();

    // Get current user ID for socket room
    const currentUserId = parseJwt(token)?.id;
    if (currentUserId) {
      socket.emit("join_room", currentUserId);
    }

    // 👂 Listener: When someone saves the contract
    socket.on("contract_updated", (updatedTeam) => {
      console.log("🔔 Real-time Contract Update:", updatedTeam);
      const normalized = normalizeTeamData(updatedTeam);
      setTeamData(normalized);
      toast.info("Contract updated by a teammate.");
    });

    // 👂 Listener: When someone signs - Smart Popup
    socket.on("member_signed", ({ signedUserName, message, allSigned }) => {
      console.log("🔔 Member Signed:", signedUserName);
      if (allSigned) {
        toast.success(`🎉 All members have signed! Contract is now locked.`);
      } else {
        toast.warning(`${signedUserName} signed. ${message}`, {
          duration: 5000,
        });
      }
      // Refetch to get latest state
      fetchStatus();
    });

    // 👂 Listener: When team is formed - Real-time Popup
    socket.on("team_formed", (data) => {
      console.log("🔔 Team Formed Notification:", data);
      setTeamFormedData(data);
      setTeamFormedDialog(true);
      toast.success(`🎉 You've been added to team "${data.teamName}"!`);
    });

    fetchStatus();

    // Cleanup on unmount
    return () => {
      socket.off("contract_updated");
      socket.off("member_signed");
      socket.off("team_formed");
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

    // Always sync memberDetails with members array to ensure names are correct
    if (normalized.members && normalized.members.length > 0) {
      // Create a map of existing memberDetails by userId for quick lookup
      const existingDetailsMap = new Map();
      if (normalized.agreement.memberDetails) {
        normalized.agreement.memberDetails.forEach((detail: any) => {
          const userId = (detail.userId?._id || detail.userId?.id || detail.userId)?.toString();
          if (userId) {
            existingDetailsMap.set(userId, detail);
          }
        });
      }

      // Build memberDetails from members array, preserving existing data
      normalized.agreement.memberDetails = normalized.members.map((m: any) => {
        const memberId = (m._id || m.id)?.toString();
        const existingDetail = existingDetailsMap.get(memberId);
        
        return {
          userId: m._id || m.id,
          name: m.name || existingDetail?.name || "Unknown", // Always get name from member
          role: existingDetail?.role || "",
          hours: existingDetail?.hours || "",
          responsibility: existingDetail?.responsibility || "",
        };
      });
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
      
      // Refresh page after a short delay to ensure socket events are processed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
        `${API_BASE_URL}/api/team/${teamData._id}/contract`, // Backend will broadcast this change via Socket
        {
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

      // Update with server response
      const normalized = normalizeTeamData(res.data.team);
      setTeamData(normalized);

      toast.success("You signed the contract! 🖋️");
      
      // The backend will emit socket event to notify other members
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

  // Check if current user has signed
  const hasCurrentUserSigned = currentUserId && 
    teamData?.agreement?.signedMembers?.some(
      (id: any) => (id?._id || id?.id || id)?.toString() === currentUserId.toString()
    );

  // Check if contract is fully signed (all members signed)
  const isContractFullySigned = teamData?.agreement?.status === "Signed";

  // Check if editing is disabled (user has signed OR contract is fully signed)
  const isEditingDisabled = hasCurrentUserSigned || isContractFullySigned;

  // --- One-click GitHub repo ---
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [createdRepoUrl, setCreatedRepoUrl] = useState<string | null>(null);

  const handleCreateRepo = async () => {
    if (!teamData?._id) return;
    setCreatingRepo(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/team/${teamData._id}/github-repo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const url = res.data?.repo?.url;
      setCreatedRepoUrl(url || null);
      if (url) {
        toast.success("GitHub repo created! Opening…");
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.success("GitHub repo created!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create GitHub repo");
    } finally {
      setCreatingRepo(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    window.print();
  };

  // Handle team formed dialog close - refresh page
  const handleTeamFormedDialogClose = () => {
    setTeamFormedDialog(false);
    // Refresh page to load the team contract
    window.location.reload();
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:border-gray-800 {
            border-color: #1f2937 !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .print\\:text-gray-700 {
            color: #374151 !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:border-gray-400 {
            border-color: #9ca3af !important;
          }
          .print\\:bg-green-50 {
            background-color: #f0fdf4 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-lg {
            font-size: 1.125rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:w-8 {
            width: 2rem !important;
          }
          .print\\:h-8 {
            height: 2rem !important;
          }
          .print\\:my-6 {
            margin-top: 1.5rem !important;
            margin-bottom: 1.5rem !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <div className="no-print">
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onSearchClick={() => {}}
          />
        </div>

      {/* Team Formed Dialog */}
      <Dialog open={teamFormedDialog} onOpenChange={setTeamFormedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">
              🎉 Team Formed!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {teamFormedData && (
                <>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {teamFormedData.teamName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {teamFormedData.creatorName} has added you to their team for{" "}
                    <span className="font-semibold">
                      {teamFormedData.hackathonName}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Review and sign the contract to get started!
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleTeamFormedDialogClose}
              className="flex-1"
            >
              View Contract
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 bg-muted/10 print-content">
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
              <div className="flex justify-between items-center mb-6 no-print">
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
                    disabled={saving || isEditingDisabled}
                    title={isEditingDisabled ? "Cannot edit after signing" : ""}
                  >
                    {saving ? (
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save & Broadcast
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    title="Download/Print PDF"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>

                  {/* One-Click Repo (only after contract is fully signed) */}
                  {isContractFullySigned && (
                    <Button
                      onClick={handleCreateRepo}
                      variant="default"
                      disabled={creatingRepo}
                      title="Create GitHub Repo"
                    >
                      {creatingRepo ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      ) : (
                        <Github className="w-4 h-4 mr-2" />
                      )}
                      One‑Click Repo
                    </Button>
                  )}
                </div>
              </div>

              <Card className="min-h-[600px] border-border shadow-xl bg-card flex flex-col print:shadow-none print:border-0">
                {/* Legal Document Header */}
                <div className="p-8 pb-4 border-b print:border-b-2 print:border-gray-800">
                  <div className="text-center space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Gavel className="w-8 h-8 text-primary" />
                      <h2 className="text-3xl font-bold tracking-wide text-foreground">
                        TEAM AGREEMENT
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      {teamData.hackathonName || "Hackathon Project"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Effective Date: {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-8 space-y-8 flex-1 print:p-12">
                  {/* MEMBER RESPONSIBILITIES */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-primary rounded-full" />
                        <h3 className="font-bold text-xl text-foreground tracking-tight">
                          ARTICLE I: MEMBER RESPONSIBILITIES
                        </h3>
                      </div>
                      {isEditingDisabled && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-yellow-700 dark:text-yellow-300">
                            {isContractFullySigned 
                              ? "Contract is locked - All members have signed"
                              : "You cannot edit after signing"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="border-2 border-border rounded-lg overflow-hidden print:border-gray-800">
                      <div className="grid grid-cols-12 bg-muted/30 p-4 text-xs font-bold uppercase border-b-2 tracking-wider print:bg-gray-100 print:border-gray-800">
                        <div className="col-span-3">Member Name</div>
                        <div className="col-span-3">Assigned Role</div>
                        <div className="col-span-6">Primary Responsibilities</div>
                      </div>
                      {teamData.agreement.memberDetails?.map(
                        (m: any, i: number) => {
                          // Get member name - check memberDetails first, then members array
                          const memberId = (m.userId?._id || m.userId?.id || m.userId)?.toString();
                          const memberFromArray = teamData.members?.find(
                            (mem: any) => (mem._id || mem.id)?.toString() === memberId
                          );
                          const displayName = m.name || memberFromArray?.name || "Unknown";
                          
                          return (
                          <div
                            key={i}
                            className="grid grid-cols-12 p-4 border-b last:border-b-0 items-center gap-3 hover:bg-muted/10 print:border-gray-400"
                          >
                            <div className="col-span-3 text-sm font-semibold pl-2 print:text-base">
                              {displayName}
                            </div>
                            <div className="col-span-3">
                              <Input
                                value={m.role || ""}
                                onChange={(e) =>
                                  updateMemberDetail(i, "role", e.target.value)
                                }
                                disabled={isEditingDisabled}
                                className="h-9 text-sm print:hidden disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="e.g. Frontend Developer"
                              />
                              <div className="hidden print:block text-sm font-medium">
                                {m.role || "TBD"}
                              </div>
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
                                disabled={isEditingDisabled}
                                className="h-9 text-sm print:hidden disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="e.g. UI/UX Design & Implementation"
                              />
                              <div className="hidden print:block text-sm font-medium">
                                {m.responsibility || "TBD"}
                              </div>
                            </div>
                          </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <Separator className="my-8 print:my-6 print:border-gray-800" />

                  {/* RULES */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-8 bg-primary rounded-full" />
                      <h3 className="font-bold text-xl text-foreground tracking-tight">
                        ARTICLE II: GOVERNANCE & OWNERSHIP
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 p-4 border-2 border-border rounded-lg print:border-gray-800">
                        <Label className="text-base font-semibold">
                          Intellectual Property Ownership
                        </Label>
                        <Select
                          value={teamData.agreement.ipRule}
                          onValueChange={(v) => updateAgreementRule("ipRule", v)}
                          disabled={isEditingDisabled}
                        >
                          <SelectTrigger className="print:hidden" disabled={isEditingDisabled}>
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
                        <div className="hidden print:block text-sm font-medium pt-2">
                          {teamData.agreement.ipRule === "opensource"
                            ? "Open Source"
                            : teamData.agreement.ipRule === "joint"
                            ? "Joint Ownership"
                            : "Leader Owned"}
                        </div>
                        <p className="text-xs text-muted-foreground print:text-gray-700">
                          All intellectual property created during this project
                          shall be governed by the selected ownership model.
                        </p>
                      </div>
                      <div className="space-y-3 p-4 border-2 border-border rounded-lg print:border-gray-800">
                        <Label className="text-base font-semibold">
                          Decision Making Process
                        </Label>
                        <Select
                          value={teamData.agreement.decisionRule}
                          onValueChange={(v) =>
                            updateAgreementRule("decisionRule", v)
                          }
                          disabled={isEditingDisabled}
                        >
                          <SelectTrigger className="print:hidden" disabled={isEditingDisabled}>
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
                        <div className="hidden print:block text-sm font-medium pt-2">
                          {teamData.agreement.decisionRule === "majority"
                            ? "Majority Vote"
                            : teamData.agreement.decisionRule === "leader"
                            ? "Leader Decides"
                            : "Unanimous Consensus"}
                        </div>
                        <p className="text-xs text-muted-foreground print:text-gray-700">
                          All major decisions shall be made according to the
                          selected process.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8 print:my-6 print:border-gray-800" />

                  {/* SIGNATURES */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-8 bg-primary rounded-full" />
                      <h3 className="font-bold text-xl text-foreground tracking-tight">
                        ARTICLE III: SIGNATURES
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 print:text-gray-700">
                      By signing below, each member acknowledges that they have
                      read, understood, and agree to be bound by the terms of
                      this agreement.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                      {teamData.members?.map((member: any) => {
                        const memberId = member._id || member.id || member;
                        const hasSigned =
                          teamData.agreement.signedMembers?.includes(memberId);

                        return (
                          <div
                            key={memberId}
                            className={`p-5 border-2 rounded-lg flex items-center justify-between transition-all print:border-gray-800 ${
                              hasSigned
                                ? "bg-green-50 border-green-500/50 shadow-sm print:bg-green-50"
                                : "bg-muted/5 border-muted/50 print:bg-white"
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-bold text-base mb-1 print:text-lg">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground print:text-sm print:text-gray-600">
                                {hasSigned ? (
                                  <span className="flex items-center gap-1">
                                    <Check className="w-4 h-4 text-green-600" />
                                    Signed Digitally
                                  </span>
                                ) : (
                                  "Pending Signature"
                                )}
                              </p>
                              {hasSigned && (
                                <p className="text-xs text-muted-foreground mt-2 print:text-sm print:text-gray-600">
                                  Date: {new Date().toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {hasSigned && (
                              <Check className="w-6 h-6 text-green-600 print:w-8 print:h-8" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="p-6 bg-muted/20 border-t flex flex-col md:flex-row justify-between items-center gap-4 no-print">
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
                    teamData.agreement.signedMembers?.some(
                      (id: any) => (id?._id || id?.id || id)?.toString() === currentUserId.toString()
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
                        disabled={isContractFullySigned}
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
    </>
  );
}
