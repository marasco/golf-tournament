"use client";

import { Event } from "@/lib/types";
import { useRouter } from "next/navigation";

interface EventsDropdownProps {
  events: Event[];
}

export function EventsDropdown({ events }: EventsDropdownProps) {
  const router = useRouter();

  if (events.length === 0) return null;

  return (
    <div className="flex justify-center">
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) router.push(`/events/${e.target.value}`);
          e.target.value = "";
        }}
        className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
      >
        <option value="" disabled className="text-gray-800">
          Ver jornada...
        </option>
        {events.map((event) => {
          const [, month, day] = event.date.split("-");
          const label = `${event.name} — ${parseInt(day)}/${parseInt(month)}`;
          return (
            <option key={event.id} value={event.id} className="text-gray-800">
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
