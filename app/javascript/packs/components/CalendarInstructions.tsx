import React, { ReactElement } from "react";

interface CalendarInstructionsProps {
  children: ReactElement;
}

export const CalendarInstructions = ({
  children,
}: CalendarInstructionsProps): JSX.Element => {
  return (
    <article
      className="calendar-instructions"
      onClick={(e) => {
        e.preventDefault();
        document
          .querySelector(".close-instructions-button")
          .focus({ preventScroll: true });
      }}
    >
      <h1>How to edit times</h1>
      <h3>Selecting days</h3>
      <p>
        You can click on a date to edit that date’s times. You can also edit
        multiple dates by pressing down on a date and dragging into other dates
        to form a rectangular selection. The selected dates to be edited will
        appear blue.
      </p>
      <p>
        For keyboard accessibility, you can focus on a date and press ‘w’, or
        simultaneously control, shift, and ‘x’ to edit that date. To start a
        multiple-date selection, press and hold ‘q’, or simultaneously control,
        shift, and ‘z’, and use the arrow keys.
      </p>
      <p>
        To remove a date’s times, simply start a drag-selection with that date.
        Other dates in that selection will be removed as well. The selected
        dates to be removed will appear red.
      </p>
      <p>
        If you accidentally remove a date, simply reselect that date to restore
        the times. The times won’t actually be cleared until the update or
        create button is clicked, or if you’ve manually cleared them.
      </p>
      <h3>Selecting times</h3>
      <p>
        The times for a day are divided into fifteen minute intervals. Click on
        an interval to select it.
      </p>
      <p>
        You can also click and drag to select a contiguous set of intervals.
      </p>

      <p>
        For keyboard users, press and hold ‘q’ or control, shift, and ‘z’ to
        start a selection. Press the tab key to select the next interval, or
        shift and tab to select the previous time interval.
      </p>

      <p>
        When you’ve finished editing times, click the update or create button to
        submit your changes.
      </p>
      {children}
    </article>
  );
};
