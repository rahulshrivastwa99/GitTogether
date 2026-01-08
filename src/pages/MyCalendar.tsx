import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  _id?: string;
  title: string;
  date: string;
  note: string;
}

export default function MyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/calendar", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  const addNote = async (event: CalendarEvent) => {
    await fetch("http://localhost:5000/api/calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: event.title,
        date: event.date,
        note,
      }),
    });

    window.location.reload();
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <Calendar /> My Hackathon Calendar
      </h1>

      {events.map((event) => (
        <Card key={event._id} className="p-6 mb-4">
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <p className="text-sm text-muted-foreground">{event.date}</p>

          <Input
            placeholder="Add your preparation notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="my-3"
          />

          <Button onClick={() => addNote(event)}>Save Note</Button>

          {event.note && <p className="mt-3 text-green-500">📝 {event.note}</p>}
        </Card>
      ))}
    </div>
  );
}
