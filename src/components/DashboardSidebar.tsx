import { motion } from "framer-motion";
import {
  Users,
  Calculator,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Lightbulb, // <--- Imported Lightbulb icon
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSearchClick: () => void;
}

// Updated navigation items list
const navItems = [
  { icon: Users, label: "Matches", path: "/dashboard" },
  { icon: Lightbulb, label: "Idea Spark", path: "/dashboard/ideas" }, // <--- New Item
  {
    icon: Calculator,
    label: "Equity Calculator",
    path: "/dashboard/calculator",
  },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export const DashboardSidebar = ({
  collapsed,
  onToggle,
  onSearchClick,
}: DashboardSidebarProps) => {
  // Shared classes for links and buttons
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
      {/* Logo Section */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
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

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        {/* 1. Matches Link */}
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

        {/* 2. Search Button */}
        <button onClick={onSearchClick} className={itemClasses}>
          <Search className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
          {!collapsed && <span className="font-medium">Search</span>}
        </button>

        {/* 3. Remaining Links (Idea Spark, Calculator, Settings) */}
        {navItems.slice(1).map((item) => (
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
      </nav>
    </motion.aside>
  );
};
