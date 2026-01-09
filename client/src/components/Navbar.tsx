import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  showProfile?: boolean;
}

export const Navbar = ({ showProfile = false }: NavbarProps) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23222222'/%3E%3Ccircle cx='35' cy='40' r='12' fill='%23FF6B6B'/%3E%3Crect x='28' y='55' width='14' height='28' rx='7' fill='%23FF6B6B'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%2342C2FF'/%3E%3Crect x='58' y='55' width='14' height='28' rx='7' fill='%2342C2FF'/%3E%3Cpath d='M35 65 Q50 50 65 65' stroke='%2300FF88' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='50' cy='52' r='3' fill='%2300FF88'/%3E%3C/svg%3E"
              alt="GitTogether Logo"
              className="w-8 h-8 rounded-lg hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            GitTogether
          </span>
        </Link>

        {showProfile && (
          <Link to="/dashboard">
            <Avatar className="w-10 h-10 border-2 border-primary/50 hover:border-primary transition-colors cursor-pointer">
              <AvatarImage src="" />
              <AvatarFallback className="bg-secondary text-foreground">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </motion.nav>
  );
};
