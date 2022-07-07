import React, {
  CSSProperties,
  PointerEvent,
  ReactElement,
  Ref,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  MutableRefObject,
} from "react";

interface HourCellProps {
  hour: number;
  onPointerDownHandler: ((hour: number, min: number) => void) | null;
  onPointerEnterHandler: ((hour: number, min: number) => void) | null;
  onPointerUpHandler: (() => void) | null;
  onPointerCancelHandler: (() => void) | null;
  isReadOnly?: boolean;
  highlightClassName: (hour: number, min: number) => string;
  isSelectedClassName?: string;
  isSelectedChild?: JSX.Element;
  colorMap?: (hour: number, min: number) => CSSProperties;
}

interface HourCellRef {
  scrollIntoView: () => void;
  focus: () => void;
}

const selectTimeIntervalKey = "q";
const ctrlShiftKey = "z";
let keyIsDown = false;

const HourCell = React.forwardRef(
  (
    {
      hour,
      onPointerDownHandler,
      onPointerEnterHandler,
      onPointerUpHandler,
      onPointerCancelHandler,
      isReadOnly,
      highlightClassName,
      isSelectedClassName,
      isSelectedChild,
      colorMap,
    }: HourCellProps,
    ref: Ref<HourCellRef>
  ) => {
    const times = [new Date(new Date().getFullYear(), 0, 1, hour, 0, 0, 0)];
    for (let i = 15; i < 60; i += 15) {
      const date = new Date(times[0].getTime());
      date.setMinutes(i);
      times.push(date);
    }
    const startingHourCellRef = useRef<HTMLDivElement>();
    const focusRef = useRef<HTMLDivElement>();

    useImperativeHandle(
      ref,
      () => ({
        // The ref hourCellRef in TimeSelector
        // is passed to every HourCell
        // and useImperativeHandle is called for each of them.
        // We have to ensure the correct DOM elements are used
        // by overwriting the scrollIntoView/focus values
        // only if it's the correct element
        scrollIntoView:
          hour === 9
            ? () => startingHourCellRef.current.scrollIntoView()
            : (ref as MutableRefObject<HourCellRef>).current?.scrollIntoView,

        focus:
          focusRef.current === document.getElementById("initial-focus-element")
            ? () => focusRef.current.focus()
            : (ref as MutableRefObject<HourCellRef>).current?.focus,
      }),
      [hour, ref]
    );

    return (
      <div className="hour-cell">
        <span
          className="time-input-hour"
          {...(hour === 9 && { ref: startingHourCellRef })}
        >
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
              if (
                !keyIsDown &&
                (e.key === selectTimeIntervalKey ||
                  (e.ctrlKey && e.shiftKey && e.key === ctrlShiftKey))
              ) {
                keyIsDown = true;
                onPointerDownHandler(time.getHours(), time.getMinutes());
              }
              // trap focus inside
              if (
                time.getHours() === 0 &&
                time.getMinutes() === 0 &&
                e.shiftKey &&
                e.key === "Tab"
              ) {
                e.preventDefault();
                (
                  document.querySelector(".select-date-btn") as HTMLElement
                )?.focus();
              }
            },
            onKeyUp: (e: React.KeyboardEvent) => {
              if (
                keyIsDown &&
                (e.key === selectTimeIntervalKey || e.key === ctrlShiftKey)
              ) {
                keyIsDown = false;
                onPointerUpHandler?.();
              }
            },
            onFocus: () => {
              if (keyIsDown || isReadOnly) {
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
              {...(isInitialFocusElement && {
                id: "initial-focus-element",
                ref: focusRef,
              })}
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
  onKeyPressHandler: (e: React.KeyboardEvent) => void | null;
  isReadOnly?: boolean;
  title: string;
  highlightClassName: (hour: number, min: number) => string;
  isSelectedClassName?: string;
  isSelectedChild?: JSX.Element;
  colorMap?: (hour: number, min: number) => CSSProperties;
  children?: ReactElement;
  className: string;
}

const TimeSelector = ({
  date,
  onPointerDownHandler,
  onPointerEnterHandler,
  onPointerLeaveHandler,
  onPointerUpHandler,
  onPointerCancelHandler,
  onKeyPressHandler,
  isReadOnly = false,
  highlightClassName,
  isSelectedChild,
  isSelectedClassName,
  colorMap,
  children,
  className,
}: TimeSelectorProps): JSX.Element => {
  const times = [] as number[];
  for (let hour = 0; hour < 24; hour += 1) {
    times.push(hour);
  }
  const todaysDate = date?.toDateString() ?? "Multiple dates selected";
  const hourCellRef = useRef<HourCellRef | null>(null);

  useLayoutEffect(() => {
    if (hourCellRef.current) {
      hourCellRef.current.scrollIntoView();

      hourCellRef.current.focus();
    }
  }, []);

  return (
    <div
      aria-label={`Times for ${todaysDate}`}
      className={className}
      {...(onPointerLeaveHandler
        ? { onPointerLeave: onPointerLeaveHandler }
        : {})}
      onKeyDown={onKeyPressHandler}
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
              isReadOnly={isReadOnly}
              {...(colorMap && { colorMap })}
              highlightClassName={highlightClassName}
              ref={hourCellRef}
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
