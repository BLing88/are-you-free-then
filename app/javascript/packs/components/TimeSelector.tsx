import React, { Fragment, ReactElement } from "react";

interface TimeSelectorProps {
  date: string;
  onPointerDownHandler: ((time: string) => void) | null;
  onPointerLeaveHandler: (() => void) | null;
  onPointerEnterHandler: ((time: string) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  title: string;
  highlightClassName: (time: string) => string;
  children: ReactElement;
}

const numFifteenMinsInADay = 1440;
const TimeSelector = ({
  date,
  onPointerDownHandler,
  onPointerEnterHandler,
  onPointerLeaveHandler,
  onPointerUpHandler,
  onPointerCancelHandler,
  highlightClassName,
  children,
}: TimeSelectorProps): JSX.Element => {
  const times = [] as Date[];
  const dateObj = new Date(
    +date.slice(0, 4),
    +date.slice(5, 7) - 1,
    +date.slice(-2)
  );
  for (let i = 0; i < numFifteenMinsInADay; i += 15) {
    dateObj.setHours(Math.floor(i / 60));
    dateObj.setMinutes(i % 60);
    times.push(new Date(dateObj.getTime()));
  }
  const todaysDate = dateObj.toDateString();

  return (
    <div
      className="time-selector-input"
      {...(onPointerLeaveHandler
        ? { onPointerLeave: onPointerLeaveHandler }
        : {})}
    >
      <div className="time-input-empty-div" />
      <div className="time-input-minutes">
        <span className="time-input-minutes-cell">00-15</span>
        <span className="time-input-minutes-cell">15-30</span>
        <span className="time-input-minutes-cell">30-45</span>
        <span className="time-input-minutes-cell">45-00</span>
      </div>
      {times.map((time) => {
        const onPointerHandlers = {
          onPointerDown: () => onPointerDownHandler(time.toISOString()),
          onPointerEnter: () => onPointerEnterHandler(time.toISOString()),
          onPointerUp: onPointerUpHandler,
          onPointerCancel: onPointerCancelHandler,
        };
        return (
          <Fragment key={time.getTime()}>
            {time.getMinutes() === 0 && (
              <small className="time-input-hour">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                })}
              </small>
            )}
            <div
              // use a function of time cell to return highlight class name
              className={`time-input-cell ${highlightClassName(
                time.toISOString()
              )} `}
              {...(onPointerDownHandler !== null && onPointerHandlers)}
            ></div>
          </Fragment>
        );
      })}
      <span className="time-input-date">{todaysDate}</span>
      <div className="time-input-back-btn">{children}</div>
    </div>
  );
};

export { TimeSelector };
