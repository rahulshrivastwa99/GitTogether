import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { UserProfile } from "@/pages/Dashboard";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useEffect, useState } from "react";

interface MatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: UserProfile | null;
  currentUserImage: string;
  onStartChat: () => void; // 🔥 ADD THIS
}

export function MatchDialog({
  isOpen,
  onClose,
  matchedUser,
  currentUserImage,
  onStartChat, // 🔥 ADD THIS
}: MatchDialogProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  // 🎵 Celebration Sound Effect (Premium Match Sound)
  const playCelebrationSound = () => {
    try {
      // Check if AudioContext is available
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      
      // Create a pleasant celebration sound (ascending major chord)
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (C major chord)
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine'; // Smooth, pleasant tone
        
        // Create a bell-like envelope with smooth fade
        const now = audioContext.currentTime;
        const startTime = now + index * 0.08; // Staggered start for chord effect
        const duration = 0.8;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
      
      // Clean up audio context after sound finishes
      setTimeout(() => {
        if (audioContext.state !== 'closed') {
          audioContext.close().catch(() => {});
        }
      }, 2000);
    } catch (error) {
      // Silently fail if audio is not available (some browsers require user interaction)
      // This is expected behavior in some browsers
    }
  };

  // Trigger confetti and sound when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Play celebration sound
      playCelebrationSound();
      
      // Stop confetti after 5 seconds for better performance
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!matchedUser) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Confetti Celebration Effect 🎉 */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={300}
              gravity={0.3}
              initialVelocityY={20}
              colors={['#ec4899', '#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6']}
              style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
            />
          )}

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { type: "spring", damping: 15, stiffness: 300 },
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 rounded-3xl shadow-2xl text-center overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-600/20 to-blue-600/20 animate-spin-slow pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-6 space-y-2">
                <div className="flex justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-lg font-display">
                  IT'S A MATCH!
                </h1>
                <p className="text-gray-300">
                  You and {matchedUser.name} like each other.
                </p>
              </div>

              {/* Avatars colliding */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <motion.div
                  initial={{ x: -50, rotate: -15 }}
                  animate={{ x: 0, rotate: -5 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-pink-500/50">
                    <AvatarImage
                      src={currentUserImage}
                      className="object-cover"
                    />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                </motion.div>

                <motion.div
                  initial={{ x: 50, rotate: 15 }}
                  animate={{ x: 0, rotate: 5 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-cyan-500/50">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${matchedUser.name}`}
                      className="object-cover"
                    />
                    <AvatarFallback>{matchedUser.name[0]}</AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={onStartChat} // 🔥 ATTACH HANDLER HERE
                  className="w-full h-12 text-lg rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg group"
                >
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Send a Message
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={onClose}
                >
                  Keep Swiping
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
