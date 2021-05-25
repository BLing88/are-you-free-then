import React from "react";
import { render } from "react-dom";
import { Calendar } from "./components/Calendar";
import { EventCalendar } from "./components/EventCalendar";

document.addEventListener("turbolinks:load", () => {
  const container = document.getElementById("react-calendar-input");
  if (container) {
    render(<Calendar />, container);
  }
  const eventCalendarContainer = document.getElementById(
    "react-event-calendar"
  );
  if (eventCalendarContainer) {
    render(<EventCalendar />, eventCalendarContainer);
  }
});
