import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";

interface SwipeControlsProps {
  onPass: () => void;
  onConnect: () => void;
}

export const SwipeControls = ({ onPass, onConnect }: SwipeControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-8">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPass}
        className="w-16 h-16 rounded-full border-2 border-destructive flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <X className="w-8 h-8" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onConnect}
        className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground glow-primary animate-glow-pulse"
      >
        <Heart className="w-10 h-10" />
      </motion.button>
    </div>
  );
};
