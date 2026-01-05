import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { TechTag } from "./TechTag";
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
  achievements: string[]; // Added this line
  avatarGradient: string;
}

interface SwipeCardProps {
  user: UserProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop?: boolean;
}

export const SwipeCard = ({ user, onSwipe, isTop = false }: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);
  const opacity = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.5, 1, 1, 1, 0.5]
  );

  const passOpacity = useTransform(x, [-150, 0], [1, 0]);
  const connectOpacity = useTransform(x, [0, 150], [0, 1]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 150) {
      setExitX(1000);
      setTimeout(() => onSwipe("right"), 10);
    } else if (info.offset.x < -150) {
      setExitX(-1000);
      setTimeout(() => onSwipe("left"), 10);
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
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Swipe Indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute -top-4 -left-4 z-10 px-4 py-2 rounded-lg border-2 border-destructive text-destructive font-bold text-lg rotate-[-15deg] bg-background/80 backdrop-blur-sm"
          >
            PASS
          </motion.div>
          <motion.div
            style={{ opacity: connectOpacity }}
            className="absolute -top-4 -right-4 z-10 px-4 py-2 rounded-lg border-2 border-success text-success font-bold text-lg rotate-[15deg] bg-background/80 backdrop-blur-sm"
          >
            CONNECT
          </motion.div>
        </>
      )}

      <div
        className={cn(
          "glass rounded-3xl overflow-hidden border border-white/10 shadow-xl bg-card",
          isTop ? "shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]" : ""
        )}
      >
        <div
          className="h-48 relative"
          style={{ background: user.avatarGradient }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl drop-shadow-md animate-in zoom-in duration-300">
              👤
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer hover:opacity-80 transition-opacity group">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  {user.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-maximize-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" x2="14" y1="3" y2="10" />
                    <line x1="3" x2="10" y1="21" y2="14" />
                  </svg>
                </h2>
                <p className="text-primary font-medium">{user.role}</p>
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
                  {/* NOW DYNAMIC: Reads from user.achievements */}
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

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {user.bio}
          </p>

          <div className="flex flex-wrap gap-2">
            {user.techStack.slice(0, 3).map((tech) => (
              <TechTag key={tech} label={tech} size="sm" />
            ))}
            {user.techStack.length > 3 && (
              <span className="text-xs text-muted-foreground flex items-center">
                +{user.techStack.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
