import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TechTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export const TechTag = ({ label, selected = false, onClick, size = "md" }: TechTagProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "rounded-full font-medium transition-all duration-200",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm",
        selected
          ? "gradient-primary text-primary-foreground glow-primary"
          : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"
      )}
    >
      {label}
    </motion.button>
  );
};
