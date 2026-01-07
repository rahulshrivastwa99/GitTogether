import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  Github,
  Linkedin,
  Code2,
  GraduationCap,
  MapPin,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/pages/Dashboard";
import { RiskBadge } from "./RiskBadge"; // Ensure this exists

interface SwipeCardProps {
  user: UserProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
  exitDirection: "left" | "right";
}

export const SwipeCard = ({
  user,
  onSwipe,
  isTop,
  exitDirection,
}: SwipeCardProps) => {
  // Motion Values for Dragging
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Swipe Indicators Opacity
  const passOpacity = useTransform(x, [-150, -50], [1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);

  const variants = {
    initial: { scale: 0.95, y: 10, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: {
      x: exitDirection === "left" ? -500 : 500,
      opacity: 0,
      rotate: exitDirection === "left" ? -20 : 20,
      transition: { duration: 0.3 },
    },
  };

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
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        zIndex: isTop ? 10 : 5,
      }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`absolute w-full max-w-sm h-[600px] ${
        isTop ? "z-10 cursor-grab active:cursor-grabbing" : "z-0"
      }`}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      {/* Swipe Indicators (Like/Nope) */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-10 right-10 z-20 border-4 border-red-500 text-red-500 font-black text-3xl px-4 py-2 rounded-xl rotate-12 pointer-events-none bg-black/40 backdrop-blur-md"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-10 z-20 border-4 border-green-500 text-green-500 font-black text-3xl px-4 py-2 rounded-xl -rotate-12 pointer-events-none bg-black/40 backdrop-blur-md"
          >
            LIKE
          </motion.div>
        </>
      )}

      {/* GLASSMORPHISM CARD */}
      <Card className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-2xl shadow-2xl">
        {/* Animated Background Gradient */}
        <div
          className="absolute inset-0 opacity-20 blur-3xl"
          style={{ background: user.avatarGradient }}
        />

        {/* --- CARD CONTENT --- */}
        <div className="relative h-full flex flex-col p-6 z-10">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mt-6 mb-4 relative">
            <div className="relative group">
              <div
                className="absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"
                style={{ background: user.avatarGradient }}
              ></div>
              <div className="relative w-28 h-28 rounded-full p-1 bg-black">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border-2 border-white/10">
                  <span className="text-4xl font-bold text-white/90">
                    {user.name[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Trigger (Click Name to Open Profile) */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer group text-center mt-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                    {user.name} <Info className="w-4 h-4 opacity-50" />
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-white/50 text-xs mt-1 uppercase tracking-widest font-medium">
                    <GraduationCap className="w-3 h-3" />
                    <span>{user.college}</span>
                  </div>
                </div>
              </DialogTrigger>

              {/* --- MODAL CONTENT --- */}
              <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                      style={{ background: user.avatarGradient }}
                    >
                      {user.name[0]}
                    </div>
                    {user.name}
                  </DialogTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="border-zinc-700">
                      {user.role}
                    </Badge>
                    {/* RISK BADGE IN MODAL */}
                    {user.stats && (
                      <RiskBadge
                        completionRate={user.stats.completionRate}
                        activityLevel={user.stats.activityLevel}
                        availability={user.stats.availability}
                      />
                    )}
                  </div>
                </DialogHeader>

                <ScrollArea className="h-[400px] w-full rounded-md border border-zinc-800 p-4 bg-zinc-900/50">
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-zinc-300">
                        About
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-zinc-300">
                        🏆 Achievements
                      </h3>
                      <ul className="list-disc list-inside text-zinc-400 space-y-1">
                        {user.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-zinc-300">
                        ⚡ Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* Role Badge (On Card) */}
          <div className="flex justify-center mb-4">
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-lg"
            >
              {user.role}
            </Badge>
          </div>

          {/* Risk Badge (On Card - Floating) */}
          <div className="absolute top-4 right-4">
            {user.stats && (
              // Simple visual indicator for card view
              <div
                className={`w-3 h-3 rounded-full ${
                  user.stats.activityLevel === "High"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                } shadow-[0_0_10px_currentColor]`}
              />
            )}
          </div>

          {/* Skills Grid (Limited) */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {user.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-xs text-zinc-300 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Bio Quote */}
          <div className="bg-zinc-900/50 rounded-xl p-4 mb-auto border border-white/5 relative">
            <div className="absolute top-2 left-2 text-white/10 text-2xl font-serif">
              "
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed text-center px-2 line-clamp-3">
              {user.bio}
            </p>
          </div>

          {/* Footer Icons */}
          <div className="flex justify-center gap-8 mt-4 pt-6 border-t border-white/5">
            <Github className="w-5 h-5 text-white/70 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-white/70 hover:text-blue-400 cursor-pointer transition-colors" />
            <Code2 className="w-5 h-5 text-white/70 hover:text-green-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
