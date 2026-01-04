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
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Merge
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
