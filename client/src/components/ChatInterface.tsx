import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface ChatProps {
  partner: {
    id: string;
    _id?: string;
    name: string;
    avatarGradient?: string;
  };
  currentUserImage: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({ partner, isOpen, onClose }: ChatProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // --- 1. SAFE DATA EXTRACT ---
  const partnerId = partner?.id || partner?._id;
  const partnerName = partner?.name || "Hacker";

  const myId = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.id || null;
  }, [token]);

  // --- 2. SOCKET & HISTORY LOGIC ---
  useEffect(() => {
    if (!isOpen || !partnerId || !token || !myId) return;

    // Initialize Socket Connection
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }

    const socket = socketRef.current;

    // Join personal room
    socket.emit("join_room", myId);

    // Inside ChatInterface.tsx useEffect
    socket.on("user_status", (status) => {
      console.log(`${partnerName} is now ${status}`);
    });

    // Fetch Chat History
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${partnerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Chat Load Error:", err);
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Listen for real-time messages
    const handleReceive = (msg: Message) => {
      const isRelevant =
        (msg.sender === partnerId && msg.receiver === myId) ||
        (msg.sender === myId && msg.receiver === partnerId);

      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [isOpen, partnerId, token, myId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. ACTIONS ---
  const handleSend = async () => {
    if (!newMessage.trim() || !myId || !partnerId || !socketRef.current) return;

    const msgData = {
      senderId: myId,
      receiverId: partnerId,
      content: newMessage,
    };

    socketRef.current.emit("send_message", msgData);
    setNewMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999]"
        >
          {/* HEADER */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`}
                  />
                  <AvatarFallback>{partnerName[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {partnerName}
                </h3>
                <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Secure Room Active
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/30 dark:bg-black/10">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-full gap-2">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
                <p className="text-xs text-muted-foreground">Syncing chat...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-full text-destructive gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 px-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  👋
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  It's a Match!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Send a message to start planning your hackathon project.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isMe = msg.sender === myId;
                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Write your message..."
                className="bg-zinc-100 dark:bg-zinc-900 border-none focus-visible:ring-1 ring-primary"
              />
              <Button
                size="icon"
                className="shrink-0 bg-primary hover:bg-primary/90 shadow-md"
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function parseJwt(token: string | null) {
  if (!token || token === "undefined") return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error("JWT Parse Error", e);
    return null;
  }
}
export default ChatInterface;
