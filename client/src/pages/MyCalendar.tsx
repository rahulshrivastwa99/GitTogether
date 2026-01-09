import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, parseISO } from "date-fns"; // ✅ Better date handling
import axios from "axios";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Trophy,
  AlertCircle,
  Loader2,
  List,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/api";

// --- TYPES ---
interface Event {
  _id: string;
  title: string;
  date: string; // ISO String from DB
  type: "Hackathon" | "Meeting" | "Deadline";
  description?: string;
}

export default function MyCalendar() {
  const { token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<string>("Deadline");
  const [isAdding, setIsAdding] = useState(false);

  // --- 1. FETCH EVENTS ---
  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📅 Loaded Events:", res.data); // Debugging Log
      setEvents(res.data);
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Could not load events");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ADD EVENT ---
  const handleAddEvent = async () => {
    if (!newEventTitle || !date) {
      toast.warning("Please enter a title and select a date");
      return;
    }

    setIsAdding(true);
    try {
      // Create date at noon to avoid timezone issues shifting the day
      const eventDate = new Date(date);
      eventDate.setHours(12, 0, 0, 0);

      const res = await axios.post(
        `${API_BASE_URL}/api/events`,
        {
          title: newEventTitle,
          date: eventDate.toISOString(),
          type: newEventType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents([...events, res.data]);
      setNewEventTitle("");
      toast.success("Event added successfully");
    } catch (error) {
      toast.error("Failed to add event");
    } finally {
      setIsAdding(false);
    }
  };

  // --- 3. DELETE EVENT ---
  const handleDeleteEvent = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((e) => e._id !== id));
      toast.success("Event removed");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  // --- 4. FILTER LOGIC ---
  const selectedDateEvents = events.filter(
    (e) => date && isSameDay(parseISO(e.date), date)
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Hackathon":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "Meeting":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              Schedule & Deadlines
            </h1>
            <p className="text-muted-foreground mt-2">
              Track hackathons, team meetings, and project milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: CALENDAR UI */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 border-border/50 bg-card shadow-lg flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  // 🔥 HIGHLIGHT DAYS WITH EVENTS
                  modifiers={{
                    hasEvent: (day) =>
                      events.some((e) => isSameDay(parseISO(e.date), day)),
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      textDecorationColor: "var(--primary)",
                      color: "var(--primary)",
                    },
                  }}
                />
              </Card>

              {/* Add Event Form moved here for better mobile flow */}
              <Card className="p-6 border-border/50 bg-muted/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Add Event
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                      placeholder="e.g. Submit Prototype"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2 space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newEventType}
                        onValueChange={setNewEventType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Deadline">Deadline</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                          <SelectItem value="Hackathon">Hackathon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2 flex items-end">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={handleAddEvent}
                        disabled={!newEventTitle || isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT: EVENTS LIST */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {selectedDateEvents.length > 0 ? (
                    <>
                      Events for{" "}
                      {date ? format(date, "MMMM do") : "Selected Date"}
                    </>
                  ) : (
                    <>Upcoming Events</>
                  )}
                </h3>
                {selectedDateEvents.length === 0 && (
                  <Badge variant="outline">All</Badge>
                )}
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : (selectedDateEvents.length > 0
                    ? selectedDateEvents
                    : events
                  ).length > 0 ? (
                  <AnimatePresence>
                    {/* 🔥 LOGIC: If date selected has events, show them.
                        Otherwise, show ALL upcoming events so list isn't empty. 
                    */}
                    {(selectedDateEvents.length > 0
                      ? selectedDateEvents
                      : events
                    ).map((event) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-full bg-muted/50 border border-border`}
                          >
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                                {event.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(parseISO(event.date), "PPP")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center p-12 border-2 border-dashed border-border rounded-xl">
                    <List className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm">
                      No events found.
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      Select a date or add a new event.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
