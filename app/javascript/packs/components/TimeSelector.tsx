import React, {
  PointerEvent,
  ReactElement,
  Ref,
  useLayoutEffect,
  useRef,
} from "react";

interface TimeInputCellStyle {
  backgroundColor: string;
}

interface HourCellProps {
  hour: Date;
  onPointerDownHandler: ((time: string) => void) | null;
  onPointerEnterHandler: ((time: string) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  highlightClassName: (time: string) => string;
  colorMap?: (time: string) => TimeInputCellStyle;
}

const HourCell = React.forwardRef(
  (
    {
      hour,
      onPointerDownHandler,
      onPointerEnterHandler,
      onPointerUpHandler,
      onPointerCancelHandler,
      highlightClassName,
      colorMap,
    }: HourCellProps,
    ref: Ref<HTMLElement>
  ) => {
    const times = [hour];
    for (let i = 15; i < 60; i += 15) {
      const date = new Date(hour.getTime());
      date.setMinutes(i);
      times.push(date);
    }

    return (
      <div className="hour-cell">
        <span
          className="time-input-hour"
          {...(hour.getHours() === 9 && { ref })}
        >
          {hour.toLocaleTimeString([], {
            hour: "numeric",
          })}
        </span>
        {times.map((time, i) => {
          const onPointerHandlers = {
            onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
              (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
              onPointerDownHandler(time.toISOString());
            },
            onPointerEnter: () => onPointerEnterHandler(time.toISOString()),
            onPointerUp: onPointerUpHandler,
            onPointerCancel: onPointerCancelHandler,
          };
          return (
            <div
              key={time.getTime()}
              style={
                colorMap
                  ? { ...colorMap(time.toISOString()), gridArea: `cell-${i}` }
                  : { gridArea: `cell-${i}` }
              }
              // use a function of time cell to return highlight class name
              className={`time-input-cell ${highlightClassName(
                time.toISOString()
              )} `}
              {...(onPointerDownHandler !== null && onPointerHandlers)}
            ></div>
          );
        })}
      </div>
    );
  }
);
HourCell.displayName = "HourCell";

interface TimeSelectorProps {
  date: string;
  onPointerDownHandler: ((time: string) => void) | null;
  onPointerLeaveHandler: (() => void) | null;
  onPointerEnterHandler: ((time: string) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  title: string;
  highlightClassName: (time: string) => string;
  colorMap?: (time: string) => TimeInputCellStyle;
  children: ReactElement;
  className: string;
}

const numMinsInADay = 1440;
const TimeSelector = ({
  date,
  onPointerDownHandler,
  onPointerEnterHandler,
  onPointerLeaveHandler,
  onPointerUpHandler,
  onPointerCancelHandler,
  highlightClassName,
  colorMap,
  children,
  className,
}: TimeSelectorProps): JSX.Element => {
  const times = [] as Date[];
  const dateObj = new Date(
    +date.slice(0, 4),
    +date.slice(5, 7) - 1,
    +date.slice(-2)
  );
  for (let i = 0; i < numMinsInADay; i += 60) {
    dateObj.setHours(Math.floor(i / 60));
    dateObj.setMinutes(i % 60);
    times.push(new Date(dateObj.getTime()));
  }
  const todaysDate = dateObj.toDateString();
  const startingHourCellRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (startingHourCellRef.current) {
      startingHourCellRef.current.scrollIntoView();
    }
  }, []);

  return (
    <div
      className={className}
      {...(onPointerLeaveHandler
        ? { onPointerLeave: onPointerLeaveHandler }
        : {})}
    >
      <span className="time-input-date">{todaysDate}</span>
      <div className="time-cells">
        {times.map((time) => {
          return (
            <HourCell
              key={time.getTime()}
              hour={time}
              onPointerEnterHandler={onPointerEnterHandler}
              onPointerDownHandler={onPointerDownHandler}
              onPointerUpHandler={onPointerUpHandler}
              onPointerCancelHandler={onPointerCancelHandler}
              {...(colorMap && { colorMap })}
              highlightClassName={highlightClassName}
              ref={startingHourCellRef}
            />
          );
        })}
      </div>
      <div className="time-input-back-btn">{children}</div>
    </div>
  );
};

export { TimeSelector };
