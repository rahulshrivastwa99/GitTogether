import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// UPDATED INTERFACE
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  techStack: string[];
  achievements: string[];
  avatarGradient: string;
}

interface SwipeCardProps {
  user: UserProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop?: boolean;
  exitDirection?: "left" | "right";
}

// ANIMATION VARIANTS
const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.3 },
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "right" ? 1000 : -1000,
    rotate: direction === "right" ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.4, ease: "easeInOut" }, // Slower, smoother exit
  }),
};

export const SwipeCard = ({
  user,
  onSwipe,
  isTop = false,
  exitDirection,
}: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.5, 1, 1, 1, 0.5]
  );

  const passOpacity = useTransform(x, [-150, 0], [1, 0]);
  const connectOpacity = useTransform(x, [0, 150], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity,
        zIndex: isTop ? 10 : 5,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={exitDirection} // Passes direction to 'exit' variant
    >
      {/* Swipe Indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-8 z-10 px-4 py-2 rounded-lg border-4 border-destructive text-destructive font-black text-2xl rotate-[15deg] bg-background/80 backdrop-blur-sm pointer-events-none"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: connectOpacity }}
            className="absolute top-8 left-8 z-10 px-4 py-2 rounded-lg border-4 border-success text-success font-black text-2xl rotate-[-15deg] bg-background/80 backdrop-blur-sm pointer-events-none"
          >
            LIKE
          </motion.div>
        </>
      )}

      {/* Card Content */}
      <div
        className={cn(
          "glass rounded-3xl overflow-hidden border border-white/10 shadow-xl bg-card h-full flex flex-col",
          isTop ? "shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]" : ""
        )}
      >
        <div
          className="h-[45%] relative flex-shrink-0"
          style={{ background: user.avatarGradient }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl drop-shadow-md animate-in zoom-in duration-300">
              👤
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3 flex flex-col flex-1">
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer hover:opacity-80 transition-opacity group">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  {user.name}
                </h2>
                <p className="text-primary font-medium text-sm">{user.role}</p>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-primary flex items-center gap-3">
                  <span className="text-4xl">👤</span> {user.name}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {user.role}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="h-[450px] w-full rounded-md border p-6 bg-muted/20">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    📖 About Me
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    🏆 Achievements
                  </h3>
                  <ul className="list-disc list-inside text-base text-muted-foreground space-y-2 ml-2">
                    {user.achievements.map((ach, index) => (
                      <li key={index}>{ach}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    ⚡ Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
            {user.bio}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {user.techStack.slice(0, 3).map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="text-[10px] px-2 py-0.5 bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                {tech}
              </Badge>
            ))}
            {user.techStack.length > 3 && (
              <span className="text-[10px] text-muted-foreground flex items-center">
                +{user.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
