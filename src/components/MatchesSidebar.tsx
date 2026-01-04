import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Match {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

interface MatchesSidebarProps {
  matches: Match[];
  isOpen: boolean;
  onClose: () => void;
  icebreaker?: string;
}

export const MatchesSidebar = ({ matches, isOpen, onClose, icebreaker }: MatchesSidebarProps) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-80 glass border-l z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Your Matches</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4">
        {/* AI Icebreaker */}
        {icebreaker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                AI Icebreaker
              </span>
            </div>
            <p className="text-sm text-foreground">{icebreaker}</p>
          </motion.div>
        )}

        {/* Matches list */}
        <div className="space-y-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="w-12 h-12 border border-border">
                  <AvatarFallback className="bg-secondary text-foreground">
                    {match.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {match.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{match.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{match.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No matches yet.</p>
            <p className="text-muted-foreground text-sm">Keep swiping!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
