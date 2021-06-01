import React, { useReducer, useMemo } from "react";
import { TimeSelector } from "./TimeSelector";
import {
  mergedIntervals,
  intervalIsLessThan,
  getDatesAndRowsOfDates,
} from "../util/time-intervals";

function getDateFromDateString(str: string): number {
  return +str.slice(-2);
}

const dayFromDateMemo = new Map();
function getDayFromDate(str: string): number {
  if (dayFromDateMemo.has(str)) {
    return dayFromDateMemo.get(str);
  }

  dayFromDateMemo.set(
    str,
    new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2)).getDay()
  );
  return dayFromDateMemo.get(str);
}

function getMonthFromDate(str: string): number {
  return +str.slice(5, 7) - 1;
}

function getYearFromDate(str: string): number {
  return +str.slice(0, 4);
}

const timeFromDateMemo = new Map();
function getTimeFromDate(str: string): number {
  if (timeFromDateMemo.has(str)) return timeFromDateMemo.get(str);

  const date = new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2));
  date.setHours(3, 0, 0);
  timeFromDateMemo.set(str, date.getTime());

  return timeFromDateMemo.get(str);
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

interface RowProps {
  dates: Date[];
  rowIndex: number;
  cellsToHighlight: string[];
  onPointerDown: (date: string) => void;
  onPointerUp: () => void;
  onPointerEnter: (date: string) => void;
  onPointerLeave: (date: string) => void;
}

const Row = ({
  dates,
  cellsToHighlight,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
}: RowProps) => {
  //const month = dates[0].toLocaleString("default", { month: "short" });
  //const year = dates[dates.length - 1].getFullYear();
  return (
    <>
      {/*  <span className="calendar-month">{month}</span> */}
      {dates.map((date, i) => {
        const formattedDate = formatDate(date);
        // const highlight = cellsToHighlight.get(formattedDate);
        return (
          <span
            className={`calendar-cell ${cellsToHighlight[i]}`}
            key={date.getTime()}
            onPointerDown={() => onPointerDown(formattedDate)}
            onPointerUp={onPointerUp}
            onPointerEnter={() => onPointerEnter(formattedDate)}
            onPointerLeave={() => onPointerLeave(formattedDate)}
            //style={
            // highlight ? { color: "#FFFFFF", backgroundColor: "#222730" } : {}
            //}
          >
            {date.getDate()}
          </span>
        );
      })}
      {/* <span className="calendar-year">{year}</span> */}
    </>
  );
};

type NumberOfPages = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

interface CalendarState {
  selectDates: boolean;
  cellsToHighlight: Map<string, boolean>;
  cellDown: string | null;
  fromDate: string | null;
  page: NumberOfPages;
  dateSelected: string | null;
  pointerDown: boolean;
  timeInputCellsToHighlight: Map<string, Map<string, boolean>>;
  initialDateTimeDown: string | null;
}

const SET_CELL_DOWN = "SET_CELL_DOWN";
const CELL_UP = "CELL_UP";
const ON_ENTER_CELL = "ON_ENTER_CELL";
const ON_POINTER_LEAVE = "ON_POINTER_LEAVE";
interface ChangeSelectionAction {
  type: typeof SET_CELL_DOWN | typeof ON_POINTER_LEAVE;
  date: string;
}

interface EnterCellAction {
  type: typeof ON_ENTER_CELL;
  date: string;
  dates: Date[];
}

interface PointerUpAction {
  type: typeof CELL_UP;
}

const MOVE_BACK = "MOVE_BACK";
const MOVE_FORWARD = "MOVE_FORWARD";

interface PaginateAction {
  type: typeof MOVE_FORWARD | typeof MOVE_BACK;
}

const SELECT_TIMES = "SELECT_TIMES";
interface SelectTimesAction {
  type: typeof SELECT_TIMES;
}

const SELECT_DATES = "SELECT_DATES";
interface SelectDatesAction {
  type: typeof SELECT_DATES;
}

const TIME_INPUT_POINTER_DOWN = "TIME_INPUT_POINTER_DOWN";
interface TimeInputPointerDownAction {
  type: typeof TIME_INPUT_POINTER_DOWN;
  dateTime: string;
}

const TIME_INPUT_ON_ENTER_CELL = "TIME_INPUT_ON_ENTER_CELL";
interface TimeInputEnterCellAction {
  type: typeof TIME_INPUT_ON_ENTER_CELL;
  dateTime: string;
}

const TIME_INPUT_POINTER_UP = "TIME_INPUT_POINTER_UP";
interface TimeInputPointerUpAction {
  type: typeof TIME_INPUT_POINTER_UP;
}

export type ReducerAction =
  | ChangeSelectionAction
  | EnterCellAction
  | PointerUpAction
  | PaginateAction
  | SelectTimesAction
  | SelectDatesAction
  | TimeInputPointerDownAction
  | TimeInputEnterCellAction
  | TimeInputPointerUpAction;

const reducer = (
  state: CalendarState,
  action: ReducerAction
): CalendarState => {
  switch (action.type) {
    case SET_CELL_DOWN: {
      if (
        !state.selectDates &&
        state.dateSelected === null &&
        state.cellsToHighlight.get(action.date)
      ) {
        const newTimeInputCellsToHighlight = new Map(
          state.timeInputCellsToHighlight
        );
        newTimeInputCellsToHighlight.set(
          action.date,
          new Map<string, boolean>(
            state.timeInputCellsToHighlight.get(action.date)
          )
        );
        return {
          ...state,
          dateSelected: action.date,
          timeInputCellsToHighlight: newTimeInputCellsToHighlight,
        };
      } else if (state.selectDates) {
        const newHighlight =
          state.cellsToHighlight.get(action.date) === undefined
            ? true
            : !state.cellsToHighlight.get(action.date);
        const newMap = new Map(state.cellsToHighlight);
        const today = new Date();
        // set to 3 AM for comparison to avoid issues with DST
        //today.setHours(3, 0, 0, 0);
        if (
          getYearFromDate(action.date) > today.getFullYear() ||
          (getYearFromDate(action.date) === today.getFullYear() &&
            (getMonthFromDate(action.date) > today.getMonth() ||
              (getMonthFromDate(action.date) === today.getMonth() &&
                getDateFromDateString(action.date) >= today.getDate())))
        ) {
          newMap.set(action.date, newHighlight);
        }
        return {
          ...state,
          cellsToHighlight: newMap,
          cellDown: action.date,
        };
      } else {
        return { ...state };
      }
    }
    case ON_POINTER_LEAVE:
      if (state.cellDown !== null) {
        return {
          ...state,
          fromDate: action.date,
        };
      }
      return state;
    case CELL_UP:
      return {
        ...state,
        cellDown: null,
        fromDate: null,
      };
    case ON_ENTER_CELL:
      if (
        state.cellDown !== null &&
        action.date !== state.cellDown &&
        state.fromDate !== null
      ) {
        const newMap = new Map(state.cellsToHighlight);

        // calculate the cells added/removed when entering a cell, based
        // on cellDown, then only need to toggle the change (the symmetric difference of the final and initial rectangular selections)

        const earlierInitialDate =
          getTimeFromDate(state.cellDown) > getTimeFromDate(state.fromDate)
            ? state.fromDate
            : state.cellDown;
        const laterInitialDate =
          getTimeFromDate(state.cellDown) > getTimeFromDate(state.fromDate)
            ? state.cellDown
            : state.fromDate;
        const earlierFinalDate =
          getTimeFromDate(state.cellDown) > getTimeFromDate(action.date)
            ? action.date
            : state.cellDown;
        const laterFinalDate =
          getTimeFromDate(state.cellDown) > getTimeFromDate(action.date)
            ? state.cellDown
            : action.date;

        const firstInitialDayOfWeek = Math.min(
          getDayFromDate(earlierInitialDate), // earlierInitialDate.getDay(),
          getDayFromDate(laterInitialDate) // laterInitialDate.getDay()
        );
        const lastInitialDayOfWeek = Math.max(
          getDayFromDate(earlierInitialDate), // earlierInitialDate.getDay(),
          getDayFromDate(laterInitialDate) // laterInitialDate.getDay()
        );

        const firstFinalDayOfWeek = Math.min(
          getDayFromDate(earlierFinalDate), // earlierFinalDate.getDay(),
          getDayFromDate(laterFinalDate) // laterFinalDate.getDay()
        );
        const lastFinalDayOfWeek = Math.max(
          getDayFromDate(earlierFinalDate), // earlierFinalDate.getDay(),
          getDayFromDate(laterFinalDate) // laterFinalDate.getDay()
        );

        const symmetricDiff = action.dates.reduce((dates, date) => {
          const dayOfWeek = date.getDay();
          const initialIsWithinDays =
            firstInitialDayOfWeek <= dayOfWeek &&
            dayOfWeek <= lastInitialDayOfWeek;
          const initialIsWithinWeeks =
            getTimeFromDate(earlierInitialDate) <= date.getTime() &&
            date.getTime() <= getTimeFromDate(laterInitialDate);
          const finalIsWithinDays =
            firstFinalDayOfWeek <= dayOfWeek && dayOfWeek <= lastFinalDayOfWeek;
          const finalIsWithinWeeks =
            getTimeFromDate(earlierFinalDate) <= date.getTime() &&
            date.getTime() <= getTimeFromDate(laterFinalDate);
          if (
            (initialIsWithinDays && initialIsWithinWeeks) !==
            (finalIsWithinDays && finalIsWithinWeeks)
          ) {
            dates.push(date);
          }

          return dates;
        }, [] as Date[]);

        const today = new Date();
        // set to midnight
        today.setHours(3, 0, 0, 0);
        for (const date of symmetricDiff) {
          if (date >= today) {
            newMap.set(
              formatDate(date),
              state.cellsToHighlight.get(state.cellDown)
            );
          }
        }
        return {
          ...state,
          cellsToHighlight: newMap,
        };
      } else {
        return state;
      }
    case MOVE_FORWARD:
      return {
        ...state,
        page: (state.page < 12 ? state.page + 2 : 12) as NumberOfPages,
      };
    case MOVE_BACK:
      return {
        ...state,
        page: (state.page > 0 ? state.page - 2 : 0) as NumberOfPages,
      };
    case SELECT_TIMES:
      return {
        ...state,
        selectDates: false,
      };
    case SELECT_DATES:
      return {
        ...state,
        selectDates: true,
        dateSelected: null,
      };
    case TIME_INPUT_POINTER_DOWN: {
      const oldHighlight = state.timeInputCellsToHighlight
        .get(state.dateSelected)
        .get(action.dateTime);
      const newHighlight = oldHighlight === undefined ? true : !oldHighlight;
      const newCellsToHighlight = new Map(state.timeInputCellsToHighlight);
      newCellsToHighlight
        .get(state.dateSelected)
        .set(action.dateTime, newHighlight);
      return {
        ...state,
        pointerDown: true,
        timeInputCellsToHighlight: newCellsToHighlight,
        initialDateTimeDown: action.dateTime,
      };
    }
    case TIME_INPUT_ON_ENTER_CELL: {
      if (!state.pointerDown) return { ...state };

      const newHighlight = !!state.timeInputCellsToHighlight
        .get(state.dateSelected)
        .get(state.initialDateTimeDown);

      const newCellsToHighlight = new Map(state.timeInputCellsToHighlight);
      newCellsToHighlight
        .get(state.dateSelected)
        .set(action.dateTime, newHighlight);
      return {
        ...state,
        timeInputCellsToHighlight: newCellsToHighlight,
      };
    }
    case TIME_INPUT_POINTER_UP:
      return {
        ...state,
        pointerDown: false,
        initialDateTimeDown: null,
      };
    default:
      return state;
  }
};

const fifteenMinsInMilliseconds = 900000;
const initializeState = ({
  initialFreeTimes,
  dates,
}: {
  initialFreeTimes: { start_time: Date; end_time: Date }[];
  dates: Date[];
}): CalendarState => {
  const initialState = {
    selectDates: true,
    cellsToHighlight: new Map<string, boolean>(),
    cellDown: null as string | null,
    fromDate: null,
    page: 0,
    dateSelected: null,
    timeInputCellsToHighlight: new Map<string, Map<string, boolean>>(),
    pointerDown: false,
    initialDateTimeDown: null,
  } as CalendarState;

  for (let { start_time, end_time } of initialFreeTimes) {
    if (
      start_time.getTime() > dates[dates.length - 1].getTime() ||
      end_time.getTime() < dates[0].getTime()
    ) {
      continue;
    }
    if (start_time.getTime() < dates[0].getTime()) {
      start_time = dates[0];
    }
    if (end_time.getTime() > dates[dates.length - 1].getTime()) {
      end_time = dates[dates.length - 1];
    }
    let date = new Date(start_time);
    while (date < end_time) {
      const formattedDate = formatDate(date);
      if (!initialState.cellsToHighlight.has(formattedDate)) {
        initialState.cellsToHighlight.set(formattedDate, true);
        initialState.timeInputCellsToHighlight.set(formattedDate, new Map());
      }
      initialState.timeInputCellsToHighlight
        .get(formattedDate)
        .set(date.toISOString(), true);
      date = new Date(date.getTime() + fifteenMinsInMilliseconds);
    }
  }
  return initialState;
};

const Calendar = (): JSX.Element => {
  const freeTimesDataset = document.getElementById("react-calendar-input")
    .dataset.free_times;
  const initialFreeTimes = useMemo(
    () =>
      JSON.parse(freeTimesDataset)
        .map(
          ({
            start_time,
            end_time,
          }: {
            start_time: string;
            end_time: string;
          }) => ({
            start_time: new Date(start_time),
            end_time: new Date(end_time),
          })
        )
        .sort(
          (
            { start_time: startTimeA, end_time: endTimeA },
            { start_time: startTimeB, end_time: endTimeB }
          ) => {
            if (startTimeA.toISOString() < startTimeB.toISOString()) {
              return -1;
            }
            if (startTimeA.toISOString() > startTimeB.toISOString()) {
              return 1;
            }
            if (
              intervalIsLessThan(
                startTimeA.toISOString(),
                endTimeA.toISOString(),
                startTimeB.toISOString(),
                endTimeB.toISOString()
              )
            ) {
              return -1;
            } else {
              return 1;
            }
          }
        ),
    [freeTimesDataset]
  );
  const todaysDate = new Date().getDay();
  const [dates, dateRows, firstOfEachMonth] = useMemo(
    () => getDatesAndRowsOfDates(),
    // eslint-disable-next-line
    [todaysDate]
  );
  const [state, dispatch] = useReducer(
    reducer,
    { initialFreeTimes, dates },
    initializeState
  );
  const onTimeInputPointerDownHandler = (time: string) =>
    dispatch({ type: TIME_INPUT_POINTER_DOWN, dateTime: time });
  const onTimeInputPointerEnterHandler = (time: string) =>
    dispatch({ type: TIME_INPUT_ON_ENTER_CELL, dateTime: time });
  const onTimeInputPointerUpOrLeaveHandler = () =>
    dispatch({ type: TIME_INPUT_POINTER_UP });

  const selectedDates = Array.from(state.cellsToHighlight.entries())
    .filter(([_, isSelected]) => isSelected)
    .map(([date, _]) => date);
  const hasSelectedDates = selectedDates.length > 0;

  const selectedTimes = [];
  for (const date of selectedDates) {
    if (state.timeInputCellsToHighlight.get(date) !== undefined) {
      const times = state.timeInputCellsToHighlight.get(date);
      for (const [time, isSelected] of times.entries()) {
        if (isSelected) {
          selectedTimes.push(time);
        }
      }
    }
  }

  const selectedTimeIntervals = mergedIntervals(selectedTimes);

  let deleteTimeIntervals = [];
  let newTimeIntervals = [];
  if (initialFreeTimes.length === 0) {
    newTimeIntervals = selectedTimeIntervals.slice();
  } else if (selectedTimeIntervals.length === 0) {
    deleteTimeIntervals = initialFreeTimes.slice();
  } else {
    let newTimesPointer = 0;
    let oldTimesPointer = 0;
    while (
      newTimesPointer < selectedTimeIntervals.length &&
      oldTimesPointer < initialFreeTimes.length
    ) {
      const oldInterval = initialFreeTimes[oldTimesPointer];
      const newInterval = selectedTimeIntervals[newTimesPointer];
      if (
        oldInterval.start_time.toISOString() !== newInterval[0] ||
        oldInterval.end_time.toISOString() !== newInterval[1]
      ) {
        if (
          intervalIsLessThan(
            oldInterval.start_time.toISOString(),
            oldInterval.end_time.toISOString(),
            newInterval[0],
            newInterval[1]
          )
        ) {
          deleteTimeIntervals.push(oldInterval);
          oldTimesPointer++;
        } else {
          newTimeIntervals.push(newInterval);
          newTimesPointer++;
        }
      } else {
        oldTimesPointer++;
        newTimesPointer++;
      }
    }
    if (
      newTimesPointer === selectedTimeIntervals.length &&
      oldTimesPointer < initialFreeTimes.length
    ) {
      deleteTimeIntervals.splice(
        -1,
        0,
        ...initialFreeTimes.slice(oldTimesPointer)
      );
    } else if (
      oldTimesPointer === initialFreeTimes.length &&
      newTimesPointer < selectedTimeIntervals.length
    ) {
      newTimeIntervals.splice(
        -1,
        0,
        ...selectedTimeIntervals.slice(newTimesPointer)
      );
    }
  }
  const highlightClassName = (time: string) => {
    let className = "";
    if (state.timeInputCellsToHighlight.get(state.dateSelected)?.get(time)) {
      className += "highlight-cell";
    }
    return className;
  };

  const maxNumRowsFirstMonth =
    firstOfEachMonth[state.page + 1] - firstOfEachMonth[state.page] + 1;
  const numRowsFirstMonth =
    maxNumRowsFirstMonth -
    (dateRows[
      maxNumRowsFirstMonth + firstOfEachMonth[state.page] - 1
    ][0].getDate() === 1
      ? 1
      : 0);
  const maxNumRowsSecondMonth =
    firstOfEachMonth[state.page + 2] - firstOfEachMonth[state.page + 1] + 1;
  const numRowsSecondMonth =
    maxNumRowsSecondMonth -
    (dateRows[
      maxNumRowsSecondMonth + firstOfEachMonth[state.page + 1] - 1
    ][0].getDate() === 1
      ? 1
      : 0);
  const isInGrid = (index: number, page: number, numRows: number): boolean =>
    index >= 0 &&
    index < dates.length &&
    dateRows[firstOfEachMonth[page]][0].getTime() <= dates[index].getTime() &&
    dates[index].getTime() <=
      dateRows[firstOfEachMonth[page] + numRows - 1][6].getTime();

  return (
    <>
      <div className="calendar-grid">
        <p className="calendar-month">
          {dateRows[firstOfEachMonth[state.page]][6].toLocaleString("default", {
            month: "long",
          })}
        </p>
        <p className="calendar-year">
          {dateRows[firstOfEachMonth[state.page]][6].getFullYear()}
        </p>

        <div
          className="calendar"
          onPointerLeave={() => dispatch({ type: CELL_UP })}
        >
          {dateRows
            .slice(
              firstOfEachMonth[state.page],
              numRowsFirstMonth + firstOfEachMonth[state.page]
            )
            .map((row, rowIndex) => {
              const classNames = row.map((date, index) => {
                if (!state.cellsToHighlight.get(formatDate(date))) {
                  return "";
                }
                let className =
                  "calendar-highlight-cell " +
                  (date.getMonth() !==
                  dateRows[firstOfEachMonth[state.page]][6].getMonth()
                    ? "not-same-month "
                    : "");
                const indexInDatesArr =
                  index + 7 * (firstOfEachMonth[state.page] + rowIndex);
                const onRightBoundary = index === 6;
                const onLeftBoundary = index === 0;
                const onTopBoundary = rowIndex === 0;
                const onBottomBoundary = rowIndex === numRowsFirstMonth - 1;
                const topCellSelected =
                  isInGrid(
                    indexInDatesArr - 7,
                    state.page,
                    numRowsFirstMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr - 7])
                  );
                const bottomCellSelected =
                  isInGrid(
                    indexInDatesArr + 7,
                    state.page,
                    numRowsFirstMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr + 7])
                  );
                const leftCellSelected =
                  isInGrid(
                    indexInDatesArr - 1,
                    state.page,
                    numRowsFirstMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr - 1])
                  );
                const rightCellSelected =
                  isInGrid(
                    indexInDatesArr + 1,
                    state.page,
                    numRowsFirstMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr + 1])
                  );
                if (topCellSelected && !onTopBoundary) {
                  className += "flat-top ";
                }
                if (bottomCellSelected && !onBottomBoundary) {
                  className += "flat-bottom ";
                }
                if (leftCellSelected && !onLeftBoundary) {
                  className += "flat-left ";
                }
                if (rightCellSelected && !onRightBoundary) {
                  className += "flat-right ";
                }
                return className;
              });
              return (
                <Row
                  key={row[0].getTime()}
                  dates={row}
                  rowIndex={rowIndex}
                  cellsToHighlight={classNames}
                  onPointerDown={(date: string) => {
                    dispatch({ type: SET_CELL_DOWN, date });
                  }}
                  onPointerEnter={(date: string) =>
                    dispatch({ type: ON_ENTER_CELL, date, dates })
                  }
                  onPointerUp={() => {
                    dispatch({ type: CELL_UP });
                  }}
                  onPointerLeave={(date: string) =>
                    dispatch({ type: ON_POINTER_LEAVE, date })
                  }
                />
              );
            })}
        </div>
      </div>
      <div className="calendar-grid">
        <p className="calendar-month">
          {dateRows[firstOfEachMonth[state.page + 1]][6].toLocaleString(
            "default",
            {
              month: "long",
            }
          )}
        </p>
        <p className="calendar-year">
          {dateRows[firstOfEachMonth[state.page + 1]][6].getFullYear()}
        </p>

        <div
          className="calendar"
          onPointerLeave={() => dispatch({ type: CELL_UP })}
        >
          {dateRows
            .slice(
              firstOfEachMonth[state.page + 1],
              numRowsSecondMonth + firstOfEachMonth[state.page + 1]
            )
            .map((row, rowIndex) => {
              const classNames = row.map((date, index) => {
                if (!state.cellsToHighlight.get(formatDate(date))) {
                  return "";
                }
                let className =
                  "calendar-highlight-cell " +
                  (date.getMonth() !==
                  dateRows[firstOfEachMonth[state.page + 1]][6].getMonth()
                    ? "not-same-month "
                    : "");
                const indexInDatesArr =
                  index + 7 * (firstOfEachMonth[state.page + 1] + rowIndex);
                const onRightBoundary = index === 6;
                const onLeftBoundary = index === 0;
                const onTopBoundary = rowIndex === 0;
                const onBottomBoundary = rowIndex === numRowsSecondMonth - 1;
                const topCellSelected =
                  isInGrid(
                    indexInDatesArr - 7,
                    state.page + 1,
                    numRowsSecondMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr - 7])
                  );
                const bottomCellSelected =
                  isInGrid(
                    indexInDatesArr + 7,
                    state.page + 1,
                    numRowsSecondMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr + 7])
                  );
                const leftCellSelected =
                  isInGrid(
                    indexInDatesArr - 1,
                    state.page + 1,
                    numRowsSecondMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr - 1])
                  );
                const rightCellSelected =
                  isInGrid(
                    indexInDatesArr + 1,
                    state.page + 1,
                    numRowsSecondMonth
                  ) &&
                  state.cellsToHighlight.get(
                    formatDate(dates[indexInDatesArr + 1])
                  );
                if (topCellSelected && !onTopBoundary) {
                  className += "flat-top ";
                }
                if (bottomCellSelected && !onBottomBoundary) {
                  className += "flat-bottom ";
                }
                if (leftCellSelected && !onLeftBoundary) {
                  className += "flat-left ";
                }
                if (rightCellSelected && !onRightBoundary) {
                  className += "flat-right ";
                }
                return className;
              });

              return (
                <Row
                  key={row[0].getTime()}
                  dates={row}
                  rowIndex={rowIndex}
                  cellsToHighlight={classNames}
                  onPointerDown={(date: string) => {
                    dispatch({ type: SET_CELL_DOWN, date });
                  }}
                  onPointerEnter={(date: string) =>
                    dispatch({ type: ON_ENTER_CELL, date, dates })
                  }
                  onPointerUp={() => {
                    dispatch({ type: CELL_UP });
                  }}
                  onPointerLeave={(date: string) =>
                    dispatch({ type: ON_POINTER_LEAVE, date })
                  }
                />
              );
            })}
        </div>
      </div>

      {!state.selectDates &&
        hasSelectedDates &&
        state.dateSelected !== null && (
          <TimeSelector
            date={state.dateSelected}
            title={"Select times"}
            highlightClassName={highlightClassName}
            onPointerLeaveHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerUpHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerCancelHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerDownHandler={onTimeInputPointerDownHandler}
            onPointerEnterHandler={onTimeInputPointerEnterHandler}
          />
        )}
      <div className="btns">
        {state.selectDates && (
          <button
            type="button"
            className="back-btn"
            onClick={() =>
              dispatch({
                type: MOVE_BACK,
              })
            }
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="select-btn"
          onClick={() =>
            dispatch({ type: state.selectDates ? SELECT_TIMES : SELECT_DATES })
          }
        >
          {state.selectDates ? "Times" : "Dates"}
        </button>
        <input
          type="submit"
          name="commit"
          value="Update"
          data-disable-with="Update"
        />

        {state.selectDates && (
          <button
            type="button"
            className="forward-btn"
            onClick={() =>
              dispatch({
                type: MOVE_FORWARD,
              })
            }
          >
            Forward
          </button>
        )}
      </div>

      {!state.selectDates && state.dateSelected === null && (
        <p>Choose a date to select times for</p>
      )}
      {newTimeIntervals.length > 0 &&
        newTimeIntervals.map(([start, end]) => (
          <input
            key={`${start}_${end}`}
            type="hidden"
            name={"create_intervals[]"}
            value={`${start}_${end}`}
          />
        ))}
      {deleteTimeIntervals.length > 0 &&
        deleteTimeIntervals.map(({ start_time: start, end_time: end }) => (
          <input
            key={`${start.toISOString()}_${end.toISOString()}`}
            type="hidden"
            name="delete_intervals[]"
            value={`${start.toISOString()}_${end.toISOString()}`}
          />
        ))}
    </>
  );
};

export { Calendar };
