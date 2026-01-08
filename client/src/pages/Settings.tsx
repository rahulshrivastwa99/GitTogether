import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  User,
  Github,
  Briefcase,
  GraduationCap,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    role: "",
    bio: "",
    github: "",
    mode: "Chill",
    skills: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");

  // 1. Fetch Current Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // 2. Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const handleModeChange = (value: string) => {
    setFormData({ ...formData, mode: value });
  };

  // 3. Skills Logic
  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, newSkill.trim()],
        });
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  // 4. Save Changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/update",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local storage so Dashboard reflects changes immediately
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userCollege", res.data.user.college);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account and profile details.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </motion.div>

          <div className="grid gap-8">
            {/* AVATAR SECTION */}
            <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6 shadow-sm">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`}
                />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.role} • {formData.college}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {formData.mode} Mode
                  </Badge>
                </div>
              </div>
            </div>

            {/* FORM SECTION */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College / University</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend Dev</SelectItem>
                      <SelectItem value="Backend">Backend Dev</SelectItem>
                      <SelectItem value="FullStack">Full Stack</SelectItem>
                      <SelectItem value="AI/ML">AI / ML Engineer</SelectItem>
                      <SelectItem value="Design">UI/UX Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hackathon Mode</Label>
                  <Select
                    value={formData.mode}
                    onValueChange={handleModeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chill">☕ Chill (Learning)</SelectItem>
                      <SelectItem value="Beast">🔥 Beast (Winning)</SelectItem>
                      <SelectItem value="Newbie">
                        🎓 Newbie (First Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile (Optional)</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              {/* SKILLS INPUT */}
              <div className="space-y-3">
                <Label>Skills & Tech Stack</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 text-sm flex items-center gap-1"
                    >
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type a skill and press Enter (e.g. React)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {saving ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
