import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ArrowLeft,
  Check,
  Clock,
  Sparkles,
  MoreVertical,
} from "lucide-react";

// Importing UI components you already have
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  name: string;
  role: string;
  online: boolean;
  avatar?: string;
}

interface MatchesSidebarProps {
  matches: Match[];
  isOpen: boolean;
  onClose: () => void;
  icebreaker?: string;
}

// --- DUMMY DATA FOR DEMO ---
const MOCK_REQUESTS_RECEIVED = [
  { id: "r1", name: "Priya Das", role: "Frontend Developer", time: "2h ago" },
  { id: "r2", name: "Amit Shah", role: "Backend Architect", time: "5h ago" },
];

const MOCK_REQUESTS_SENT = [
  {
    id: "s1",
    name: "Arjun Reddy",
    role: "Cybersecurity Analyst",
    status: "Pending",
  },
];

const MOCK_CHAT_HISTORY = [
  {
    id: 1,
    sender: "them",
    text: "Hey! I saw your profile, love your React projects.",
  },
  {
    id: 2,
    sender: "me",
    text: "Thanks! I'm actually looking for a backend dev for the hackathon.",
  },
  {
    id: 3,
    sender: "them",
    text: "That's perfect, I work with Node and Go. Shall we team up?",
  },
];

export const MatchesSidebar = ({
  matches,
  isOpen,
  onClose,
  icebreaker,
}: MatchesSidebarProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(MOCK_CHAT_HISTORY);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), sender: "me", text: messageInput },
    ]);
    setMessageInput("");
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-card border-l border-border z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* === VIEW 1: CHAT INTERFACE (Shown when a match is clicked) === */}
        {selectedMatch ? (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMatch(null)}
                className="hover:bg-background rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback>{selectedMatch.name[0]}</AvatarFallback>
                </Avatar>
                {selectedMatch.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-sm leading-none">
                  {selectedMatch.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {selectedMatch.role}
                </span>
              </div>

              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 bg-background/50">
              <div className="space-y-4">
                {/* AI Icebreaker Tip */}
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-xs text-primary mb-6 flex gap-2 items-start">
                  <Sparkles className="w-4 h-4 mt-0.5" />
                  <p>
                    {icebreaker ||
                      `Ask ${selectedMatch.name} about their recent projects!`}
                  </p>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* === VIEW 2: TABS LIST (Matches & Requests) === */
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card">
              <h2 className="text-xl font-bold">Connections</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* TABS Component */}
            <Tabs defaultValue="matches" className="flex-1 flex flex-col">
              <div className="px-6 mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="matches">Matches</TabsTrigger>
                  <TabsTrigger value="requests" className="relative">
                    Requests
                    {MOCK_REQUESTS_RECEIVED.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border-2 border-background" />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: MATCHES */}
              <TabsContent value="matches" className="flex-1 p-0 mt-2">
                <ScrollArea className="h-full px-4">
                  {matches.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No matches yet.</p>
                      <p className="text-sm">Keep swiping to find your team!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border/50"
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12 border border-border">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {match.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {match.online && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {match.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {match.role}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Send className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* TAB 2: REQUESTS */}
              <TabsContent value="requests" className="flex-1 p-0 mt-2">
                <ScrollArea className="h-full px-4">
                  <div className="pt-2 pb-6 space-y-6">
                    {/* Received Requests */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 px-2">
                        Received{" "}
                        <Badge variant="secondary" className="h-5 px-1.5">
                          {MOCK_REQUESTS_RECEIVED.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {MOCK_REQUESTS_RECEIVED.map((req) => (
                          <div
                            key={req.id}
                            className="p-3 rounded-xl border border-border bg-muted/20"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{req.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {req.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {req.role}
                                </p>
                              </div>
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {req.time}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 h-8 bg-primary hover:bg-primary/90 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1.5" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                              >
                                <X className="h-3 w-3 mr-1.5" /> Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sent Requests */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 px-2">
                        Sent{" "}
                        <Badge variant="secondary" className="h-5 px-1.5">
                          {MOCK_REQUESTS_SENT.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {MOCK_REQUESTS_SENT.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10 opacity-70"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{req.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {req.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {req.role}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal gap-1"
                            >
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>
    </>
  );
};
