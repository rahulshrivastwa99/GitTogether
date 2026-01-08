import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  emoji: string;
  title: string;
  description: string;
  variant: "beast" | "chill" | "newbie";
  selected?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  beast: {
    gradient: "gradient-beast",
    glow: "glow-beast",
    border: "border-destructive/50",
    selectedBorder: "border-destructive",
  },
  chill: {
    gradient: "gradient-chill",
    glow: "glow-chill",
    border: "border-accent/50",
    selectedBorder: "border-accent",
  },
  newbie: {
    gradient: "gradient-newbie",
    glow: "glow-newbie",
    border: "border-warning/50",
    selectedBorder: "border-warning",
  },
};

export const ModeCard = ({
  emoji,
  title,
  description,
  variant,
  selected = false,
  onClick,
}: ModeCardProps) => {
  const styles = variantStyles[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-2xl glass border-2 transition-all duration-300 text-left w-full",
        selected ? `${styles.selectedBorder} ${styles.glow}` : styles.border,
        "hover:border-opacity-100"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={selected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: selected ? Infinity : 0, repeatDelay: 1 }}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl",
            styles.gradient
          )}
        >
          {emoji}
        </motion.div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {selected && (
        <motion.div
          layoutId="mode-indicator"
          className={cn("absolute inset-0 rounded-2xl border-2", styles.selectedBorder)}
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};
