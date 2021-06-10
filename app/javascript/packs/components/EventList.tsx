import React from "react";

export interface Event {
  id: number;
  name: string;
  host: string;
}

interface EventListProps {
  events: Event[];
}

export const EventList = ({ events }: EventListProps) => {
  return events.length > 0 ? (
    <ul className="event-list">
      <li className="event-li">
        <span className="event-name-header">Event</span>{" "}
        <span className="host-name-header">Host</span>
      </li>
      {events.map((event) => (
        <li key={event.id} className="event-li">
          <a href={`/events/${event.id}`} className="event-link">
            {event.name}
          </a>
          <span>{event.host}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p>You currently aren’t participating in any events.</p>
  );
};
