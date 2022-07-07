import React from "react";

export interface Invite {
  id: number;
  event_name: string;
  host: string;
  event_id: number;
}

interface EventInvitesListProps {
  invites: Invite[];
  CSRFToken: string;
  userID: number;
}

export const EventInvitesList = ({
  invites,
  CSRFToken,
  userID,
}: EventInvitesListProps): JSX.Element => {
  return invites.length > 0 ? (
    <ul className="event-invite-list">
      <li className="event-invite-li">
        <span className="event-name-header">Event</span>{" "}
        <span className="host-name-header">Host</span>
      </li>
      {invites.map((invite) => (
        <li key={invite.id} className="event-invite-li">
          <span>{invite.event_name}</span>
          <span>{invite.host}</span>
          <form action="/participations" acceptCharset="UTF-8" method="post">
            <input type="hidden" name="authenticity_token" value={CSRFToken} />
            <input
              id="event_id"
              value={invite.event_id}
              type="hidden"
              name="event_id"
            />
            <input id="user_id" value={userID} type="hidden" name="user_id" />
            <input
              type="submit"
              name="commit"
              value="Accept"
              data-disable-with="Accept"
            />
          </form>
          <a
            rel="nofollow"
            data-method="delete"
            href={`/event_invites/${invite.id}`}
            aria-label="delete"
            className="delete-invite-link"
          >
            &times;
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <p>You currently have no invites.</p>
  );
};
