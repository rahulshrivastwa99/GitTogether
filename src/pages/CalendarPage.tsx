import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Trophy,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- MOCK HACKATHON DATA ---
const EVENTS = [
  {
    date: "2026-01-10",
    title: "Smart India Hackathon",
    type: "Live",
    color: "bg-green-500",
  },
  {
    date: "2026-01-11",
    title: "Smart India Hackathon",
    type: "Live",
    color: "bg-green-500",
  },
  {
    date: "2026-01-12",
    title: "Smart India Hackathon",
    type: "Live",
    color: "bg-green-500",
  },
  {
    date: "2026-01-15",
    title: "EthIndia Online",
    type: "Live",
    color: "bg-green-500",
  },
  {
    date: "2026-01-22",
    title: "Innovators Hackathon",
    type: "Upcoming",
    color: "bg-blue-500",
  },
  {
    date: "2026-01-23",
    title: "Innovators Hackathon",
    type: "Upcoming",
    color: "bg-blue-500",
  },
  {
    date: "2026-02-05",
    title: "HackWithInfy",
    type: "Upcoming",
    color: "bg-blue-500",
  },
  {
    date: "2025-12-10",
    title: "ETHGlobal",
    type: "Past",
    color: "bg-red-500",
  },
];

export default function CalendarPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Jan 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Notes State
  const [notes, setNotes] = useState<{ [key: string]: string[] }>({
    "2026-01-15": ["Team meeting at 6 PM", "Submit project proposal"],
    "2026-01-20": ["Practice DSA for 2 hours"],
  });
  const [newNoteInput, setNewNoteInput] = useState("");

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);

  const formatDateKey = (d: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleAddNote = () => {
    if (!selectedDate || !newNoteInput.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newNoteInput],
    }));
    setNewNoteInput("");
  };

  const handleDeleteNote = (dateKey: string, index: number) => {
    setNotes((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index),
    }));
  };

  // Get data for selected date
  const selectedEvents = selectedDate
    ? EVENTS.filter((e) => e.date === selectedDate)
    : [];
  const selectedNotes = selectedDate ? notes[selectedDate] || [] : [];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchClick={() => {}}
      />

      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {/* --- LEFT: CALENDAR GRID --- */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-primary" />
                Scheduler
              </h1>
              <p className="text-muted-foreground">
                Manage your hackathons and personal deadlines.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-lg border border-border">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="font-bold text-lg w-40 text-center">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-muted-foreground text-sm uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-7 gap-2 auto-rows-[100px] md:auto-rows-[120px]">
            {/* Empty Slots */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 opacity-50" />
            ))}

            {/* Days */}
            {Array.from({ length: days }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(dayNum);
              const dayEvents = EVENTS.filter((e) => e.date === dateKey);
              const dayNotes = notes[dateKey];
              const isSelected = selectedDate === dateKey;
              const isToday =
                new Date().toDateString() ===
                new Date(year, month, dayNum).toDateString();

              return (
                <motion.div
                  key={dayNum}
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`
                    relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between
                    ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border bg-card hover:bg-muted/50"
                    }
                    ${
                      isToday
                        ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-background"
                        : ""
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-bold ${
                        isToday ? "text-purple-500" : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayNotes && dayNotes.length > 0 && (
                      <div
                        className="w-2 h-2 rounded-full bg-yellow-500"
                        title="Has Notes"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded-full text-white ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: SIDEBAR DETAILS --- */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="w-full md:w-96 bg-card border-l border-border p-6 shadow-2xl flex flex-col h-full overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {new Date(selectedDate).toLocaleDateString("default", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(null)}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                {/* Events Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Hackathons
                  </h3>

                  {selectedEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEvents.map((ev, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-border bg-background/50 relative overflow-hidden group"
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${ev.color}`}
                          />
                          <h4 className="font-bold">{ev.title}</h4>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {ev.type} Event
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-xl text-center">
                      No hackathons scheduled.
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> My Notes
                  </h3>

                  <div className="space-y-3 mb-4">
                    {selectedNotes.length > 0 ? (
                      selectedNotes.map((note, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                          <p className="text-sm flex-1 leading-relaxed">
                            {note}
                          </p>
                          <button
                            onClick={() => handleDeleteNote(selectedDate, i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10 p-1 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No notes for this day.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a task..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                      className="bg-background"
                    />
                    <Button size="icon" onClick={handleAddNote}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
