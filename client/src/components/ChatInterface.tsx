import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

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
    role?: string;
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

  const partnerId = partner?.id || partner?._id;
  const partnerName = partner?.name || "Hacker";

  const myId = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.id || null;
  }, [token]);

  // --- SOCKET LOGIC ---
  useEffect(() => {
    if (!token || !myId) return;

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    const socket = socketRef.current;
    socket.emit("join_room", myId);

    const handleReceiveMessage = (msg: Message) => {
      const isFromCurrentPartner = msg.sender === partnerId;
      if (isFromCurrentPartner) {
        setMessages((prev) => {
          const exists = prev.find(
            (m) =>
              m._id === msg._id ||
              (m.timestamp === msg.timestamp && m.content === msg.content)
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [myId, partnerId, token]);

  // --- HISTORY LOGIC ---
  useEffect(() => {
    if (!isOpen || !partnerId || !token) return;

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
        setError("Messages load karne mein dikkat aayi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen, partnerId, token]);

  // Auto-scroll logic
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // --- ACTIONS ---
  const handleSend = async () => {
    if (!newMessage.trim() || !myId || !partnerId || !socketRef.current) return;

    const msgData = {
      senderId: myId,
      receiverId: partnerId,
      content: newMessage,
    };

    const tempMsg: Message = {
      sender: myId,
      receiver: partnerId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    socketRef.current.emit("send_message", msgData);
    setNewMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
          className="fixed bottom-6 right-6 w-[360px] md:w-[420px] h-[600px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden z-[9999]"
        >
          {/* HEADER (Unchanged) */}
          <div
            className="p-5 flex justify-between items-center relative overflow-hidden shrink-0"
            style={{
              background:
                partner.avatarGradient ||
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            }}
          >
            <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`}
                  />
                  <AvatarFallback className="bg-zinc-200">
                    {partnerName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-zinc-900 rounded-full shadow-lg" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-base tracking-tight leading-none mb-1 flex items-center gap-1.5 drop-shadow-sm">
                  {partnerName}
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </h3>
                <div className="flex items-center gap-1 opacity-90">
                  <ShieldCheck className="w-3 h-3 text-green-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Secure Chat
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 relative z-10 transition-transform active:scale-90"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* MESSAGE CONTAINER */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white dark:bg-zinc-900/10 scroll-smooth custom-scrollbar">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-full gap-3">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Loading Chats...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-full text-center px-4 gap-2">
                <AlertCircle className="w-10 h-10 text-red-500/40" />
                <p className="text-sm font-medium text-zinc-500">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 px-8 flex flex-col justify-center h-full">
                {/* Empty State UI */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-indigo-500/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 rotate-12 shadow-inner"
                >
                  <MessageSquare className="w-8 h-8 text-indigo-600" />
                </motion.div>
                <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-100 italic tracking-tight">
                  "Start Talking!"
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Send a message to {partnerName} to start the conversation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-[9px] text-center text-zinc-400 font-black uppercase tracking-[0.3em] my-6 opacity-50">
                  Room Encryption Active
                </div>
                {messages.map((msg, i) => {
                  const isMe = msg.sender === myId;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, x: isMe ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* 🔥 FIXED: Added bg-zinc-100 for received messages in light mode */}
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-[1.6rem] text-[13px] leading-relaxed shadow-sm transition-all border ${
                          isMe
                            ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 rounded-bl-none font-medium"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={scrollRef} className="h-4" />
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shrink-0">
            <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all shadow-sm">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium h-10"
              />
              <Button
                size="icon"
                className={`h-10 w-10 rounded-xl transition-all shadow-md active:scale-95 ${
                  newMessage.trim()
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                }`}
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

// Token helper function
function parseJwt(token: string | null) {
  if (!token || token === "undefined") return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

export default ChatInterface;
