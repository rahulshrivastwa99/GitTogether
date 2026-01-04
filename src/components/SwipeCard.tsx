import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { TechTag } from "./TechTag";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  techStack: string[];
  avatarGradient: string;
}

interface SwipeCardProps {
  user: UserProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop?: boolean;
}

export const SwipeCard = ({ user, onSwipe, isTop = false }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.5, 1, 1, 1, 0.5]);

  const passOpacity = useTransform(x, [-150, 0], [1, 0]);
  const connectOpacity = useTransform(x, [0, 150], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 150) {
      onSwipe("right");
    } else if (info.offset.x < -150) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      exit={{ 
        x: 300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute -top-4 -left-4 z-10 px-4 py-2 rounded-lg border-2 border-destructive text-destructive font-bold text-lg rotate-[-15deg]"
          >
            PASS
          </motion.div>
          <motion.div
            style={{ opacity: connectOpacity }}
            className="absolute -top-4 -right-4 z-10 px-4 py-2 rounded-lg border-2 border-success text-success font-bold text-lg rotate-[15deg]"
          >
            CONNECT
          </motion.div>
        </>
      )}

      <div className="glass rounded-3xl overflow-hidden border">
        {/* Avatar section */}
        <div 
          className="h-48 relative"
          style={{ background: user.avatarGradient }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
        </div>

        {/* Info section */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <p className="text-primary font-medium">{user.role}</p>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {user.bio}
          </p>

          <div className="flex flex-wrap gap-2">
            {user.techStack.map((tech) => (
              <TechTag key={tech} label={tech} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
