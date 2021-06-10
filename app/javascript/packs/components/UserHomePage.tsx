import React, { useState } from "react";
import { EventInvitesList, Invite } from "./EventInvitesList";
import { EventList, Event } from "./EventList";

const NOTIFICATIONS = "Notifications";
const EVENTS = "Events";
const EVENT_INVITES = "Event invites";
const FRIEND_REQUESTS = "Friend requests";

type UserHomePageState =
  | typeof NOTIFICATIONS
  | typeof EVENTS
  | typeof EVENT_INVITES
  | typeof FRIEND_REQUESTS;

export const UserHomePage = (): JSX.Element => {
  const [displayState, setDisplayState] = useState<UserHomePageState>(
    NOTIFICATIONS
  );
  const CSRFToken = document.head.querySelector<HTMLMetaElement>(
    "meta[name='csrf-token']"
  )?.content;
  const container = document.getElementById("react-user-home-page");
  const events: Event[] = JSON.parse(container.dataset["events"]);
  const invites: Invite[] = JSON.parse(container.dataset["eventInvites"]);
  const userID = JSON.parse(container.dataset["userId"]);
  return (
    <>
      <nav aria-label="home page navigation" className="home-page-nav">
        <button type="button" onClick={() => setDisplayState(NOTIFICATIONS)}>
          Notifications
        </button>
        <button type="button" onClick={() => setDisplayState(EVENTS)}>
          Events
        </button>
        <button type="button" onClick={() => setDisplayState(EVENT_INVITES)}>
          Event invites
        </button>
        <button type="button" onClick={() => setDisplayState(FRIEND_REQUESTS)}>
          Friend requests
        </button>
      </nav>

      {displayState === EVENTS && <EventList events={events} />}

      {displayState === EVENT_INVITES && (
        <EventInvitesList
          invites={invites}
          CSRFToken={CSRFToken}
          userID={userID}
        />
      )}
    </>
  );
};
