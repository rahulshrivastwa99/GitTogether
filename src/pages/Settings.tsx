import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Switch } from "@/components/ui/switch";
import { TechTag } from "@/components/TechTag";
import { cn } from "@/lib/utils";

const techOptions = [
  "React", "Python", "TypeScript", "Node.js", "Flutter", 
  "Swift", "Rust", "Go", "Java", "C++",
  "Machine Learning", "Web3", "DevOps", "UI/UX", "Mobile"
];

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    marketing: false,
  });
  const [selectedTech, setSelectedTech] = useState(["React", "TypeScript", "Python"]);

  const handleTechToggle = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 glass border-b flex items-center px-6"
        >
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </motion.header>

        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                  activeTab === tab.id
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-6 border">
                <h2 className="text-lg font-bold text-foreground mb-6">
                  Your Profile
                </h2>

                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-4xl flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Anonymous Hacker"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue="Full Stack Developer"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Tech Stack
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select the technologies you work with
                </p>
                <div className="flex flex-wrap gap-2">
                  {techOptions.map((tech) => (
                    <TechTag
                      key={tech}
                      label={tech}
                      selected={selectedTech.includes(tech)}
                      onClick={() => handleTechToggle(tech)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-semibold"
              >
                Save Changes
              </motion.button>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border"
            >
              <h2 className="text-lg font-bold text-foreground mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">New Matches</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone matches with you
                    </p>
                  </div>
                  <Switch
                    checked={notifications.matches}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, matches: checked })
                    }
                  />
                </div>

                <div className="border-t border-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, messages: checked })
                    }
                  />
                </div>

                <div className="border-t border-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Marketing</h3>
                    <p className="text-sm text-muted-foreground">
                      Tips, hackathon announcements, and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-6 border">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Privacy Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Control how your profile appears to others
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Show Online Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're active
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="border-t border-border" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow other hackers to discover your profile
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-destructive/30">
                <h2 className="text-lg font-bold text-destructive mb-4">
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  These actions are irreversible
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
