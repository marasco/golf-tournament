"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface EventFormProps {
  events: Event[];
}

export function EventForm({ events: initialEvents }: EventFormProps) {
  const [events, setEvents] = useState(initialEvents);
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseName.trim() || !date) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          course_name: courseName.trim(),
          date,
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setName("");
      setCourseName("");
      setDate("");
    } catch (err) {
      setError("Failed to create event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This will also delete all scores for this event."))
      return;

    try {
      const response = await fetch(`/admin/api/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="text"
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !name.trim() || !courseName.trim() || !date}
        >
          {loading ? "Adding..." : "Add Event"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border divide-y">
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No events yet. Add one above.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{event.name}</div>
                <div className="text-sm text-gray-600">
                  {event.course_name} • {new Date(event.date).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
