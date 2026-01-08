import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Trophy,
  Trash2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function MyCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchEvents = () => {
    fetch("http://localhost:5000/api/calendar", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setEvents);
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/calendar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto min-h-screen">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/hackathons")}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Arena
      </Button>

      <h1 className="text-4xl font-bold flex items-center gap-3 mb-10">
        <CalendarIcon className="w-10 h-10 text-purple-500" /> My Schedule
      </h1>

      <div className="grid gap-6">
        {events.length === 0 ? (
          <p className="text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
            No hackathons saved yet.
          </p>
        ) : (
          events.map((event) => (
            <Card
              key={event._id}
              className="p-6 border-l-8 border-l-purple-600 shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Badge variant="secondary">{event.host}</Badge>
                  <h2 className="text-2xl font-bold">{event.title}</h2>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy size={14} /> {event.prize}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-purple-500">
                      <CalendarIcon size={14} /> {event.date}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(event.link, "_blank")}
                  >
                    <ExternalLink size={18} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteEvent(event._id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
