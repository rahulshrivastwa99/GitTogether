import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Users,
  Zap,
  Target,
  Trophy,
  Code2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroBackground } from "@/components/HeroBackground";

// --- STEPS DATA (HOW IT WORKS) ---
const steps = [
  {
    icon: Code2,
    title: "1. Build Profile",
    desc: "Sync GitHub, list skills, and define your hackathon role.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "2. Swipe & Match",
    desc: "Our AI pairs you with teammates who complement your stack.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Trophy,
    title: "3. Ship & Win",
    desc: "Form a squad, build the project, and win the prize money.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

// --- FEATURES DATA ---
const features = [
  {
    icon: Users,
    title: "Squad Matching",
    description: "AI-powered recommendations based on skills & vibe.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Hackathon Arena",
    description: "Find and join active hackathons instantly.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Idea Spark",
    description: "Track contributions and ensure fair equity.",
    color: "from-orange-500 to-red-500",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/20">
      <HeroBackground />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <Navbar />

      {/* --- TOP RIGHT GET STARTED BUTTON --- */}
      {/* Positioned absolute to sit on top of the navbar area */}
      <div className="absolute top-5 right-6 z-50 hidden md:block">
        <Link to="/auth">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </motion.button>
        </Link>
      </div>

      {/* --- HERO SECTION (FULL SCREEN) --- */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 backdrop-blur-md border border-white/10 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-secondary-foreground">
                The future of hackathon teams
              </span>
            </motion.div>
          </motion.div>

          {/* Main Heading - REVERTED TO DEFAULT SIZE */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight"
          >
            <motion.span
              variants={itemVariants}
              className="block text-foreground"
            >
              Don't Code
            </motion.span>
            <motion.span
              variants={itemVariants}
              className="relative inline-block"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
                Alone.
              </span>
              <motion.svg
                viewBox="0 0 200 9"
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/50"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <path
                  d="M2.00025 6.99996C35.0503 3.67323 118.579 -1.82195 198.001 2.99996"
                  fill="transparent"
                  strokeWidth="4"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </motion.svg>
            </motion.span>
          </motion.h1>

          {/* Description - REVERTED TO DEFAULT SIZE */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Find your perfect hackathon teammate based on{" "}
            <span className="text-foreground font-semibold">skills</span>,{" "}
            <span className="text-foreground font-semibold">vibe</span>, and{" "}
            <span className="text-foreground font-semibold">equity</span>. Stop
            looking, start building.
          </motion.p>

          {/* Button - REVERTED TO DEFAULT SIZE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative inline-block group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-background border border-primary/20 text-foreground px-8 py-4 rounded-full text-lg font-bold flex items-center gap-3 mx-auto shadow-2xl hover:shadow-primary/20 transition-all"
              >
                Start Matching
                <div className="bg-primary/10 p-1 rounded-full">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* --- SCROLL MOUSE ANIMATION --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          {/* Mouse Shape */}
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-1 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
            {/* Animated Wheel Dot */}
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className="w-1 h-1.5 bg-muted-foreground/60 rounded-full"
            />
          </div>
          {/* Text */}
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium">
            Scroll
          </span>
        </motion.div>
      </section>

      {/* --- HOW IT WORKS (3 STEPS) SECTION --- */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              From{" "}
              <span className="text-muted-foreground line-through decoration-red-500">
                Solo
              </span>{" "}
              to <span className="text-primary">Squad</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              Three simple steps to your next win.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-yellow-500/30 z-0" />

            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div
                  className={`w-20 h-20 rounded-2xl ${step.bg} border border-white/10 flex items-center justify-center mb-4 shadow-lg backdrop-blur-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative py-20 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Why Choose <span className="text-primary">GitTogether?</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Key features designed for hackathon success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-background/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-full`}
                />

                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-inner`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 p-12 md:p-24 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to Find Your Squad?
              </h2>

              <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
                Great ideas deserve a great team. Stop coding alone and start
                building the next big thing with your perfect squad.
              </p>

              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-blue-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Get Started Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-white/10 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* FIX: Changed <link> to <img> and added sizing */}
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23222222'/%3E%3Ccircle cx='35' cy='40' r='12' fill='%23FF6B6B'/%3E%3Crect x='28' y='55' width='14' height='28' rx='7' fill='%23FF6B6B'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%2342C2FF'/%3E%3Crect x='58' y='55' width='14' height='28' rx='7' fill='%2342C2FF'/%3E%3Cpath d='M35 65 Q50 50 65 65' stroke='%2300FF88' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='50' cy='52' r='3' fill='%2300FF88'/%3E%3C/svg%3E"
              alt="GitTogether Logo"
              className="w-8 h-8 rounded-lg hover:scale-110 transition-transform duration-300"
            />
            <span className="font-bold text-lg tracking-tight">
              GitTogether
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 GitTogether. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
