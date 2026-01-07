import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Clock,
  Gavel,
  Users,
  Download,
  PenTool,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

// --- CONTRACT TYPES ---
interface ContractData {
  teamName: string;
  hackathonName: string;
  members: { name: string; role: string }[];
  ipRule: string;
  decisionRule: string;
  commitmentRule: string;
  signed: boolean;
}

export default function TeamAgreement() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ContractData>({
    teamName: "",
    hackathonName: "",
    members: [
      { name: "", role: "" },
      { name: "", role: "" },
    ], // Start with 2 slots
    ipRule: "opensource",
    decisionRule: "majority",
    commitmentRule: "flexible",
    signed: false,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const componentRef = useRef(null);

  // --- HANDLERS ---
  const updateMember = (
    index: number,
    field: "name" | "role",
    value: string
  ) => {
    const newMembers = [...data.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setData({ ...data, members: newMembers });
  };

  const addMember = () => {
    setData({ ...data, members: [...data.members, { name: "", role: "" }] });
  };

  const handlePrint = () => {
    window.print(); // Browser native print to PDF
  };

  const ipOptions = {
    opensource: "Open Source (MIT License) - Everyone can use the code later.",
    joint: "Joint Ownership - All members own the IP equally.",
    leader: "Leader Owned - The Team Lead retains all rights.",
  };

  const decisionOptions = {
    majority: "Majority Vote - We vote on major disagreements.",
    leader: "Benevolent Dictator - Team Lead makes the final call.",
    consensus: "Unanimous Consensus - We discuss until everyone agrees.",
  };

  const commitmentOptions = {
    hardcore: "Hardcore - 16+ hours/day. We are here to WIN.",
    balanced: "Balanced - 8-10 hours/day. Serious but healthy.",
    flexible: "Flexible - We work when we can. Learning is the priority.",
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-muted/20">
        <div className="max-w-4xl mx-auto w-full">
          {/* HEADER */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" /> Team Agreement
              Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Prevent drama before it starts. Generate a clear contract for
              roles, IP, and equity.
            </p>
          </div>

          {/* --- WIZARD CONTENT --- */}
          <Card className="min-h-[500px] border-border shadow-xl bg-card relative overflow-hidden flex flex-col">
            {/* STEP 1: TEAM INFO */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 space-y-6 flex-1"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Who is in the
                    squad?
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Team Name</Label>
                      <Input
                        placeholder="e.g. The Bug Slayers"
                        value={data.teamName}
                        onChange={(e) =>
                          setData({ ...data, teamName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hackathon Name</Label>
                      <Input
                        placeholder="e.g. Smart India Hackathon 2026"
                        value={data.hackathonName}
                        onChange={(e) =>
                          setData({ ...data, hackathonName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Members & Roles</Label>
                    {data.members.map((member, i) => (
                      <div key={i} className="flex gap-3">
                        <Input
                          placeholder={`Member ${i + 1} Name`}
                          value={member.name}
                          onChange={(e) =>
                            updateMember(i, "name", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Role (e.g. Frontend)"
                          value={member.role}
                          onChange={(e) =>
                            updateMember(i, "role", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addMember}
                      className="w-full border-dashed"
                    >
                      + Add Member
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-auto">
                  <Button onClick={() => setStep(2)} className="gap-2">
                    Next: The Rules <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: THE RULES */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 space-y-6 flex-1"
              >
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-orange-500" /> Set the Ground
                    Rules
                  </h2>

                  {/* IP OWNERSHIP */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Code Ownership (IP)
                    </Label>
                    <Select
                      onValueChange={(val) => setData({ ...data, ipRule: val })}
                      defaultValue={data.ipRule}
                    >
                      <SelectTrigger>
                        {" "}
                        <SelectValue />{" "}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opensource">
                          Open Source (MIT)
                        </SelectItem>
                        <SelectItem value="joint">
                          Joint Ownership (Equal)
                        </SelectItem>
                        <SelectItem value="leader">Leader Owned</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {ipOptions[data.ipRule as keyof typeof ipOptions]}
                    </p>
                  </div>

                  {/* DECISION MAKING */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Gavel className="w-4 h-4" /> Conflict Resolution
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setData({ ...data, decisionRule: val })
                      }
                      defaultValue={data.decisionRule}
                    >
                      <SelectTrigger>
                        {" "}
                        <SelectValue />{" "}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="majority">Majority Vote</SelectItem>
                        <SelectItem value="leader">Leader Decides</SelectItem>
                        <SelectItem value="consensus">
                          Unanimous Consensus
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {
                        decisionOptions[
                          data.decisionRule as keyof typeof decisionOptions
                        ]
                      }
                    </p>
                  </div>

                  {/* TIME COMMITMENT */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time Commitment
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setData({ ...data, commitmentRule: val })
                      }
                      defaultValue={data.commitmentRule}
                    >
                      <SelectTrigger>
                        {" "}
                        <SelectValue />{" "}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardcore">
                          Hardcore (16h+)
                        </SelectItem>
                        <SelectItem value="balanced">
                          Balanced (8-10h)
                        </SelectItem>
                        <SelectItem value="flexible">
                          Flexible / Chill
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {
                        commitmentOptions[
                          data.commitmentRule as keyof typeof commitmentOptions
                        ]
                      }
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-auto">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Generate Contract <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: THE CONTRACT (PREVIEW) */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full"
              >
                <div
                  className="flex-1 p-8 bg-white text-black font-serif overflow-y-auto"
                  ref={componentRef}
                >
                  <div className="border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-center uppercase tracking-widest">
                      Team Charter
                    </h1>
                    <p className="text-center italic mt-2">
                      For {data.hackathonName || "Upcoming Project"}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-2">
                        1. Parties
                      </h3>
                      <p>
                        This agreement is made between the members of team{" "}
                        <span className="font-bold">
                          "{data.teamName || "Untitled Team"}"
                        </span>
                        :
                      </p>
                      <ul className="list-disc list-inside mt-2 ml-2">
                        {data.members
                          .filter((m) => m.name)
                          .map((m, i) => (
                            <li key={i}>
                              {m.name}{" "}
                              <span className="text-gray-600 text-sm">
                                ({m.role})
                              </span>
                            </li>
                          ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-2">
                        2. Commitments
                      </h3>
                      <p>
                        <strong>Intellectual Property:</strong>{" "}
                        {ipOptions[data.ipRule as keyof typeof ipOptions]}
                      </p>
                      <p className="mt-2">
                        <strong>Decision Making:</strong>{" "}
                        {
                          decisionOptions[
                            data.decisionRule as keyof typeof decisionOptions
                          ]
                        }
                      </p>
                      <p className="mt-2">
                        <strong>Time Commitment:</strong>{" "}
                        {
                          commitmentOptions[
                            data.commitmentRule as keyof typeof commitmentOptions
                          ]
                        }
                      </p>
                    </section>

                    <section className="mt-8">
                      <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-4">
                        3. Signatures
                      </h3>
                      <div className="grid grid-cols-2 gap-8">
                        {data.members
                          .filter((m) => m.name)
                          .map((m, i) => (
                            <div key={i} className="mt-4">
                              <div className="border-b border-black h-8 flex items-end">
                                {data.signed && (
                                  <span className="font-cursive text-xl text-blue-700 italic font-bold">
                                    Signed Digitally
                                  </span>
                                )}
                              </div>
                              <p className="text-xs uppercase mt-1">{m.name}</p>
                            </div>
                          ))}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Edit
                  </Button>
                  <div className="flex gap-3">
                    {!data.signed ? (
                      <Button
                        onClick={() => setData({ ...data, signed: true })}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <PenTool className="w-4 h-4 mr-2" /> Digital Sign
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50 pointer-events-none"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Signed
                        </Button>
                        <Button
                          onClick={handlePrint}
                          variant="outline"
                          className="border-primary text-primary"
                        >
                          <Download className="w-4 h-4 mr-2" /> Print / Save PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
