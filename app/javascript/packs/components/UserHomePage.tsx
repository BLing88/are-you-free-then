import React from "react";
import { EventList, Event } from "./EventList";

export const UserHomePage = (): JSX.Element => {
  const container = document.getElementById("react-user-home-page");
  const events: Event[] = JSON.parse(container.dataset["events"]);
  return (
    <>
      <nav aria-label="home page navigation" className="home-page-nav"></nav>
      <EventList events={events} />
    </>
  );
};
