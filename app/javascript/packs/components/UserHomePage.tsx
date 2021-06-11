import React, { useState } from "react";
import { EventInvitesList, Invite } from "./EventInvitesList";
import { EventList, Event } from "./EventList";

//const NOTIFICATIONS = "Notifications";
const EVENTS = "Events";
//const EVENT_INVITES = "Event invites";
//const FRIEND_REQUESTS = "Friend requests";
const FIND_EVENT = "Find event";

type UserHomePageState =
  //  | typeof NOTIFICATIONS
  typeof EVENTS | typeof FIND_EVENT;
// | typeof EVENT_INVITES
//| typeof FRIEND_REQUESTS;

export const UserHomePage = (): JSX.Element => {
  const [displayState, setDisplayState] = useState<UserHomePageState>(EVENTS);
  const CSRFToken = document.head.querySelector<HTMLMetaElement>(
    "meta[name='csrf-token']"
  )?.content;
  const container = document.getElementById("react-user-home-page");
  const events: Event[] = JSON.parse(container.dataset["events"]);
  // const invites: Invite[] = JSON.parse(container.dataset["eventInvites"]);
  //const userID = JSON.parse(container.dataset["userId"]);
  return (
    <>
      <nav aria-label="home page navigation" className="home-page-nav">
        {/*<button type="button" onClick={() => setDisplayState(NOTIFICATIONS)}>
          Notifications
      </button>*/}
        <button type="button" onClick={() => setDisplayState(EVENTS)}>
          Events
        </button>
        <button type="button" onClick={() => setDisplayState(FIND_EVENT)}>
          Find event
        </button>
        {/*<button type="button" onClick={() => setDisplayState(EVENT_INVITES)}>
          Event invites
      </button>*/}
        {/*<button type="button" onClick={() => setDisplayState(FRIEND_REQUESTS)}>
          Friend requests
      </button>*/}
      </nav>
      {displayState === EVENTS && <EventList events={events} />}
      {displayState === FIND_EVENT && (
        <>
          <p>Enter the event code for the event you want to join:</p>
          <form
            action="/participations"
            method="post"
            className="event-code-form"
          >
            <label>
              <span>Event code</span>
              <input type="text" name="event_code" required />
            </label>
            <input type="hidden" name="authenticity_token" value={CSRFToken} />
            <input
              type="submit"
              name="commit"
              value="Join event"
              data-disable-with="Join event"
            />
          </form>
        </>
      )}

      {/* displayState === EVENT_INVITES && (
        <EventInvitesList
          invites={invites}
          CSRFToken={CSRFToken}
          userID={userID}
        />
      )*/}
    </>
  );
};
