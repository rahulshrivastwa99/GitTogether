import { motion } from "framer-motion";
import {
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Lightbulb,
  Trophy,
  CalendarDays,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSearchClick: () => void;
}

const navItems = [
  { icon: Users, label: "Matches", path: "/dashboard" },
  { icon: BarChart3, label: "Team Balance", path: "/dashboard/team-analysis" },
  { icon: Trophy, label: "Hackathons", path: "/dashboard/hackathons" },
  { icon: FileText, label: "Team Contract", path: "/dashboard/contract" },
  { icon: CalendarDays, label: "Calendar", path: "/dashboard/calendar" },
  { icon: Lightbulb, label: "Idea Spark", path: "/dashboard/ideas" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export const DashboardSidebar = ({
  collapsed,
  onToggle,
  onSearchClick,
}: DashboardSidebarProps) => {
  const { logout } = useAuth();

  const itemClasses = cn(
    "flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group w-full text-left",
    collapsed && "justify-center"
  );

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "h-screen glass border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* HEADER WITH WORKING LOGO */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {/* FIXED: Simple SVG as background-image */}
            <div
              className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-gray-800 to-black"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23222222'/%3E%3Ccircle cx='35' cy='40' r='12' fill='%23FF6B6B'/%3E%3Crect x='28' y='55' width='14' height='28' rx='7' fill='%23FF6B6B'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%2342C2FF'/%3E%3Crect x='58' y='55' width='14' height='28' rx='7' fill='%2342C2FF'/%3E%3Cpath d='M35 65 Q50 50 65 65' stroke='%2300FF88' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='50' cy='52' r='3' fill='%2300FF88'/%3E%3C/svg%3E")`,
                backgroundSize: "100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span className="text-lg font-bold text-foreground">
              GitTogether
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.slice(0, 1).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={itemClasses}
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}

        <button onClick={onSearchClick} className={itemClasses}>
          <Search className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
          {!collapsed && <span className="font-medium">Search</span>}
        </button>

        {navItems.slice(1).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={itemClasses}
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT SECTION */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className={cn(
            itemClasses,
            "hover:bg-destructive/10 hover:text-destructive text-muted-foreground/80"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-colors" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
