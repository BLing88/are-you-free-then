import React, { useState } from "react";

type TimeInputPage = 0 | 1 | 2;

interface TimeSelectorProps {
  date: string;
  cellsToHighlight: Map<string, boolean>;
  onPointerDownHandler: ((time: string) => void) | null;
  onPointerLeaveHandler: (() => void) | null;
  onPointerEnterHandler: ((time: string) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  title: string;
}

const numFifteenMinsInADay = 1440;
const TimeSelector = ({
  date,
  title,
  cellsToHighlight,
  onPointerDownHandler,
  onPointerEnterHandler,
  onPointerLeaveHandler,
  onPointerUpHandler,
  onPointerCancelHandler,
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
  const [timeInputPage, setTimeInputPage] = useState<TimeInputPage>(1);

  return (
    <>
      <div
        className="time-selector-input"
        {...(onPointerLeaveHandler
          ? { onPointerLeave: onPointerLeaveHandler }
          : {})}
      >
        <h2>{`${title} for ${dateObj.toDateString()}`}</h2>
        {times
          .slice(timeInputPage * 32, timeInputPage * 32 + 32)
          .map((time) => {
            const shouldHighlight = !!cellsToHighlight.get(time.toISOString());
            const onPointerHandlers = {
              onPointerDown: () => onPointerDownHandler(time.toISOString()),
              onPointerEnter: () => onPointerEnterHandler(time.toISOString()),
              onPointerUp: onPointerUpHandler,
              onPointerCancel: onPointerCancelHandler,
            };
            return (
              <div
                key={time.getTime()}
                className={`time-input-cell ${
                  shouldHighlight ? "highlight-cell" : ""
                }`}
                {...(onPointerDownHandler !== null && onPointerHandlers)}
              >
                <span className="hour-string">
                  {time.getMinutes() === 0 &&
                    time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
            );
          })}
      </div>
      <button
        type="button"
        className="back-btn"
        onClick={() =>
          setTimeInputPage((page) =>
            page > 0 ? ((page - 1) as TimeInputPage) : 0
          )
        }
      >
        Back
      </button>
      <button
        type="button"
        className="forward-btn"
        onClick={() =>
          setTimeInputPage((page) =>
            page === 2 ? 2 : ((page + 1) as TimeInputPage)
          )
        }
      >
        Forward
      </button>
    </>
  );
};

export { TimeSelector };
