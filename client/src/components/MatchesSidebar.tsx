import { X, Search, Check, Clock, User as UserIcon, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/pages/Dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface MatchesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  matches: UserProfile[]; // Connected users (Accepted)
  receivedRequests: UserProfile[]; // Incoming requests
  sentRequests: UserProfile[]; // Outgoing requests (Pending)
  onAccept: (user: UserProfile) => void;
  onDecline: (userId: string) => void;
  onOpenChat: (user: UserProfile) => void;
}

export const MatchesSidebar = ({
  isOpen,
  onClose,
  matches,
  receivedRequests,
  sentRequests,
  onAccept,
  onDecline,
  onOpenChat,
}: MatchesSidebarProps) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sidebar Container */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-xl">Connections</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs Area */}
              <Tabs
                defaultValue="requests"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="requests" className="relative">
                      Requests
                      {receivedRequests.length > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* --- REQUESTS TAB --- */}
                <TabsContent
                  value="requests"
                  className="flex-1 overflow-y-auto p-4 space-y-6"
                >
                  {/* 1. RECEIVED REQUESTS SECTION */}
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Received{" "}
                      <Badge variant="secondary" className="ml-1">
                        {receivedRequests.length}
                      </Badge>
                    </h3>

                    {receivedRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic pl-2">
                        No pending requests.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {receivedRequests.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 rounded-xl bg-muted/40 border border-border"
                          >
                            <div
                              className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedProfile(user)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {user.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {user.role}
                                </p>
                              </div>
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                Now
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 h-8 bg-primary/90 hover:bg-primary text-xs"
                                onClick={() => onAccept(user)}
                              >
                                <Check className="w-3 h-3 mr-1" /> Accept
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                                onClick={() => onDecline(user.id)}
                              >
                                <X className="w-3 h-3 mr-1" /> Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. SENT REQUESTS SECTION (Pending) */}
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Sent{" "}
                      <Badge variant="secondary" className="ml-1">
                        {sentRequests.length}
                      </Badge>
                    </h3>

                    {sentRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic pl-2">
                        Swipe right to send requests!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {sentRequests.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 rounded-xl bg-muted/20 border border-border flex items-center justify-between"
                          >
                            <div
                              className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedProfile(user)}
                            >
                              <Avatar className="h-10 w-10 opacity-70">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {user.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {user.role}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            >
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* --- MATCHES TAB --- */}
                <TabsContent
                  value="matches"
                  className="flex-1 overflow-y-auto p-4"
                >
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search matches..."
                      className="pl-9 h-9"
                    />
                  </div>

                  {matches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No matches yet.</p>
                      <p className="text-xs mt-1">
                        Accept requests to start chatting!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors group"
                          onClick={() => onOpenChat(match)}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${match.name}`}
                              />
                              <AvatarFallback>{match.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {match.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {match.role}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Send className="w-4 h-4 text-primary" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- PROFILE DETAILS DIALOG (POPUP) --- */}
      <Dialog
        open={!!selectedProfile}
        onOpenChange={() => setSelectedProfile(null)}
      >
        <DialogContent className="sm:max-w-md bg-card border-border">
          {selectedProfile && (
            <>
              <DialogHeader>
                <div className="h-24 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 mb-4 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-primary/50" />
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle className="text-2xl">
                    {selectedProfile.name}
                  </DialogTitle>
                  <Badge variant="outline">{selectedProfile.role}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  {selectedProfile.college}
                </div>
                <DialogDescription className="text-base text-foreground/80 py-2 italic">
                  "{selectedProfile.bio}"
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.techStack.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    Achievements
                  </h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    {selectedProfile.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
