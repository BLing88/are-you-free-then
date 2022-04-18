import React, {
  CSSProperties,
  PointerEvent,
  ReactElement,
  Ref,
  useLayoutEffect,
  useRef,
} from "react";

interface HourCellProps {
  hour: number;
  onPointerDownHandler: ((hour: number, min: number) => void) | null;
  onPointerEnterHandler: ((hour: number, min: number) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  highlightClassName: (hour: number, min: number) => string;
  isSelectedClassName?: string;
  isSelectedChild?: JSX.Element;
  colorMap?: (hour: number, min: number) => CSSProperties;
}

const selectTimeIntervalKey = "q";
let keyIsDown = false;

const HourCell = React.forwardRef(
  (
    {
      hour,
      onPointerDownHandler,
      onPointerEnterHandler,
      onPointerUpHandler,
      onPointerCancelHandler,
      highlightClassName,
      isSelectedClassName,
      isSelectedChild,
      colorMap,
    }: HourCellProps,
    ref: Ref<HTMLElement>
  ) => {
    const times = [new Date(new Date().getFullYear(), 0, 1, hour)];
    for (let i = 15; i < 60; i += 15) {
      const date = new Date(times[0].getTime());
      date.setMinutes(i);
      times.push(date);
    }

    return (
      <div className="hour-cell">
        <span className="time-input-hour" {...(hour === 9 && { ref })}>
          {times[0].toLocaleTimeString([], {
            hour: "numeric",
          })}
        </span>
        {times.map((time, i) => {
          const onPointerHandlers = {
            onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
              (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
              onPointerDownHandler(time.getHours(), time.getMinutes());
            },
            onPointerEnter: () =>
              onPointerEnterHandler(time.getHours(), time.getMinutes()),
            onPointerUp: onPointerUpHandler,
            onPointerCancel: onPointerCancelHandler,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (!keyIsDown && e.key === selectTimeIntervalKey) {
                keyIsDown = true;
                onPointerDownHandler(time.getHours(), time.getMinutes());
              }
            },
            onKeyUp: (e: React.KeyboardEvent) => {
              if (keyIsDown && e.key === selectTimeIntervalKey) {
                keyIsDown = false;
                onPointerUpHandler();
              }
            },
            onFocus: (e: React.FocusEvent) => {
              if (keyIsDown) {
                (e.target as HTMLElement).focus();
                onPointerEnterHandler(time.getHours(), time.getMinutes());
              }
            },
          };
          const classNames = highlightClassName(
            time.getHours(),
            time.getMinutes()
          );

          const isSelected = new RegExp(isSelectedClassName).test(classNames);
          const isInitialFocusElement =
            time.getHours() === 9 && time.getMinutes() === 0;

          const ariaLabel = `${time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "numeric",
          })} to ${new Date(time.getTime() + 900000).toLocaleTimeString([], {
            hour: "numeric",
            minute: "numeric",
          })}`;
          return (
            <div
              key={time.getTime()}
              {...(isInitialFocusElement && { id: "initial-focus-element" })}
              tabIndex={0}
              style={
                colorMap
                  ? {
                      ...colorMap(time.getHours(), time.getMinutes()),
                      gridArea: `cell-${i}`,
                    }
                  : { gridArea: `cell-${i}` }
              }
              // use a function of time cell to return highlight class name
              className={`time-input-cell ${classNames} `}
              {...(onPointerDownHandler !== null && onPointerHandlers)}
              aria-label={ariaLabel}
            >
              {isSelected && isSelectedChild}
            </div>
          );
        })}
      </div>
    );
  }
);
HourCell.displayName = "HourCell";

interface TimeSelectorProps {
  date?: Date;
  onPointerDownHandler: ((hour: number, min: number) => void) | null;
  onPointerLeaveHandler: (() => void) | null;
  onPointerEnterHandler: ((hour: number, min: number) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  title: string;
  highlightClassName: (hour: number, min: number) => string;
  isSelectedClassName?: string;
  isSelectedChild?: JSX.Element;
  colorMap?: (hour: number, min: number) => CSSProperties;
  children?: ReactElement;
  className: string;
}

//const numMinsInADay = 1440;
const TimeSelector = ({
  date,
  onPointerDownHandler,
  onPointerEnterHandler,
  onPointerLeaveHandler,
  onPointerUpHandler,
  onPointerCancelHandler,
  highlightClassName,
  isSelectedChild,
  isSelectedClassName,
  colorMap,
  children,
  className,
}: TimeSelectorProps): JSX.Element => {
  const times = [] as number[];
  //const dateObj = new Date(
  //  +date.slice(0, 4),
  //  +date.slice(5, 7) - 1,
  //  +date.slice(-2)
  //);
  for (let hour = 0; hour < 24; hour += 1) {
    //dateObj.setHours(Math.floor(i / 60));
    //dateObj.setMinutes(i % 60);
    //times.push(new Date(dateObj.getTime()));
    times.push(hour);
  }
  const todaysDate = date?.toDateString() ?? "Multiple dates selected";
  const startingHourCellRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (startingHourCellRef.current) {
      startingHourCellRef.current.scrollIntoView();
    }
  }, []);

  useLayoutEffect(() => {
    document.getElementById("initial-focus-element").focus();
  }, []);

  return (
    <div
      aria-label={`Times for ${todaysDate}`}
      className={className}
      {...(onPointerLeaveHandler
        ? { onPointerLeave: onPointerLeaveHandler }
        : {})}
    >
      <span className="time-input-date">{todaysDate}</span>
      <div className="time-cells">
        {times.map((hour) => {
          return (
            <HourCell
              key={hour}
              hour={hour}
              onPointerEnterHandler={onPointerEnterHandler}
              onPointerDownHandler={onPointerDownHandler}
              onPointerUpHandler={onPointerUpHandler}
              onPointerCancelHandler={onPointerCancelHandler}
              {...(colorMap && { colorMap })}
              highlightClassName={highlightClassName}
              ref={startingHourCellRef}
              isSelectedChild={isSelectedChild}
              isSelectedClassName={isSelectedClassName}
            />
          );
        })}
      </div>
      {children}
    </div>
  );
};

export { TimeSelector };
