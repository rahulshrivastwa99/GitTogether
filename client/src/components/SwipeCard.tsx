import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  animate,
} from "framer-motion";
import {
  Github,
  Linkedin,
  Code2,
  GraduationCap,
  Info,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/pages/Dashboard";

interface SwipeCardProps {
  user: UserProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
  exitDirection: "left" | "right";
}

export const SwipeCard = ({ user, onSwipe, isTop }: SwipeCardProps) => {
  // Motion Values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Swipe Indicators Opacity
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);

  const variants = {
    initial: { scale: 0.95, y: 0, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  // --- FUNCTIONALITY: LINK HANDLER ---
  const openLink = (e: React.MouseEvent, url?: string) => {
    // CRITICAL FIX: Stops the drag gesture and prevents default button behavior
    e.preventDefault();
    e.stopPropagation();

    if (!url) return;

    // Ensure the URL is absolute so it doesn't try to open as a local route
    const link = url.startsWith("http") ? url : `https://${url}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const swipeVelocity = 500;

    if (info.offset.x > threshold) {
      animate(x, swipeVelocity, { duration: 0.3 });
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      animate(x, -swipeVelocity, { duration: 0.3 });
      onSwipe("left");
    } else {
      animate(x, 0, { duration: 0.3 });
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        zIndex: isTop ? 50 : 10,
      }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`absolute w-full max-w-[340px] h-[520px] ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      drag={isTop ? "x" : false}
      // CRITICAL FIX: Ensures only the top card captures the drag listener
      dragListener={isTop}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
    >
      {/* --- SWIPE INDICATORS --- */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-12 right-8 z-[60] border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-2 rounded-lg rotate-12 bg-black/50 backdrop-blur-sm shadow-xl pointer-events-none tracking-widest"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-12 left-8 z-[60] border-4 border-green-500 text-green-500 font-black text-4xl px-4 py-2 rounded-lg -rotate-12 bg-black/50 backdrop-blur-sm shadow-xl pointer-events-none tracking-widest"
          >
            LIKE
          </motion.div>
        </>
      )}

      {/* --- MAIN CARD --- */}
      <Card className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-zinc-950 z-0" />
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-[80px]"
          style={{ background: user.avatarGradient }}
        />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-900/20 blur-[80px]" />

        <div className="relative h-full flex flex-col p-5 z-10">
          {/* Header */}
          <div className="flex justify-between items-start w-full mb-2">
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className="border-white/10 bg-black/30 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-wider w-fit"
              >
                {user.role}
              </Badge>
              {user.mode && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[9px] w-fit">
                  {user.mode}
                </Badge>
              )}
            </div>
            {user.stats && (
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.stats.activityLevel === "High"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : "bg-yellow-400"
                  }`}
                />
                <span className="text-[10px] text-white/70 font-medium">
                  {user.stats.activityLevel} Activity
                </span>
              </div>
            )}
          </div>

          {/* Avatar Area */}
          <div className="flex flex-col items-center justify-center flex-1 -mt-4">
            <div className="relative group cursor-pointer">
              <div
                className="absolute -inset-1 rounded-full opacity-60 blur-md group-hover:opacity-100 transition duration-700"
                style={{ background: user.avatarGradient }}
              />

              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative w-32 h-32 rounded-full p-1 bg-zinc-950 border-2 border-white/10 shadow-2xl hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                      <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                        {user.name[0]}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      {user.name}
                    </DialogTitle>
                    <div className="text-zinc-400 text-sm">{user.bio}</div>
                  </DialogHeader>
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-bold text-zinc-300">Tech Stack</h4>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {user.techStack.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            <div className="text-center mt-5">
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                {user.name}
                <Info className="w-4 h-4 text-zinc-500 hover:text-white transition-colors cursor-pointer" />
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-sm mt-1 font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{user.college}</span>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="mt-auto space-y-4 w-full">
            <div className="flex flex-wrap justify-center gap-1.5">
              {user.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-semibold text-zinc-300"
                >
                  {tech}
                </span>
              ))}
              {user.techStack.length > 3 && (
                <span className="px-2 py-1 text-[10px] text-zinc-500">
                  +{user.techStack.length - 3}
                </span>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
              <p className="text-xs text-zinc-300 text-center italic line-clamp-2">
                "{user.bio || "No bio provided"}"
              </p>
            </div>

            {/* CRITICAL FIX: Explicit button triggers for social links */}
            <div className="flex justify-center gap-6 pt-2 pb-1 relative z-[100]">
              {user.github && (
                <button
                  type="button"
                  onClick={(e) => openLink(e, user.github)}
                  className="hover:scale-110 transition-transform cursor-pointer outline-none"
                >
                  <Github className="w-5 h-5 text-zinc-500 hover:text-white" />
                </button>
              )}
              {user.linkedin && (
                <button
                  type="button"
                  onClick={(e) => openLink(e, user.linkedin)}
                  className="hover:scale-110 transition-transform cursor-pointer outline-none"
                >
                  <Linkedin className="w-5 h-5 text-zinc-500 hover:text-blue-400" />
                </button>
              )}
              {user.portfolio && (
                <button
                  type="button"
                  onClick={(e) => openLink(e, user.portfolio)}
                  className="hover:scale-110 transition-transform cursor-pointer outline-none"
                >
                  <Globe className="w-5 h-5 text-zinc-500 hover:text-emerald-400" />
                </button>
              )}
              {user.resume && (
                <button
                  type="button"
                  onClick={(e) =>
                    openLink(e, `http://localhost:5000/${user.resume}`)
                  }
                  className="hover:scale-110 transition-transform cursor-pointer outline-none"
                >
                  <Code2 className="w-5 h-5 text-zinc-500 hover:text-orange-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SwipeCard;
