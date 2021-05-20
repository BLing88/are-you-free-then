import React, { useReducer, useMemo } from "react";
import { TimeSelector } from "./TimeSelector";
import { mergedIntervals, intervalIsLessThan } from "../util/time-intervals";

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
  cellsToHighlight: Map<string, boolean>;
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
  const month = dates[0].toLocaleString("default", { month: "short" });
  const year = dates[dates.length - 1].getFullYear();
  return (
    <>
      <span className="calendar-month">{month}</span>
      {dates.map((date) => {
        const formattedDate = formatDate(date);
        const highlight = cellsToHighlight.get(formattedDate);
        return (
          <span
            className="calendar-cell"
            key={date.getTime()}
            onPointerDown={() => onPointerDown(formattedDate)}
            onPointerUp={onPointerUp}
            onPointerEnter={() => onPointerEnter(formattedDate)}
            onPointerLeave={() => onPointerLeave(formattedDate)}
            style={
              highlight ? { color: "green", backgroundColor: "lightblue" } : {}
            }
          >
            {date.getDate()}
          </span>
        );
      })}
      <span className="calendar-year">{year}</span>
    </>
  );
};

const dayInMilliseconds = 86400000;

interface CalendarState {
  selectDates: boolean;
  cellsToHighlight: Map<string, boolean>;
  cellDown: string | null;
  fromDate: string | null;
  page: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  timeInputPage: TimeInputPage;
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

type TimeInputPage = 0 | 1 | 2;

interface TimeInputState {
  pointerDown: boolean;
  cellsToHighlight: Map<string, boolean>;
  timeInputPage: TimeInputPage;
  initialDateTimeDown: string | null;
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

const TIME_INPUT_MOVE_FORWARD = "TIME_INPUT_MOVE_FORWARD";
const TIME_INPUT_MOVE_BACK = "TIME_INPUT_MOVE_BACK";
interface ChangeTimeInputPageAction {
  type: typeof TIME_INPUT_MOVE_FORWARD | typeof TIME_INPUT_MOVE_BACK;
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
  | TimeInputPointerUpAction
  | ChangeTimeInputPageAction;

type NumberOfWeeks = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
        page: (state.page < 12 ? state.page + 1 : 12) as NumberOfWeeks,
      };
    case MOVE_BACK:
      return {
        ...state,
        page: (state.page > 0 ? state.page - 1 : 0) as NumberOfWeeks,
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
    case TIME_INPUT_MOVE_FORWARD:
      return {
        ...state,
        timeInputPage:
          state.timeInputPage === 2
            ? 2
            : ((state.timeInputPage + 1) as TimeInputPage),
      };
    case TIME_INPUT_MOVE_BACK:
      return {
        ...state,
        timeInputPage:
          state.timeInputPage > 0
            ? ((state.timeInputPage - 1) as TimeInputPage)
            : 0,
      };
    default:
      return state;
  }
};

const getDatesAndRowsOfDates = (): [Date[], Date[][]] => {
  const today = new Date();
  today.setHours(3, 0, 0, 0);
  const dates = [today];
  for (let i = 1; i <= today.getDay(); i++) {
    dates.unshift(new Date(today.getTime() - i * dayInMilliseconds));
  }
  for (let i = 1; i < 365; i++) {
    dates.push(new Date(today.getTime() + i * dayInMilliseconds));
  }

  return [
    dates,
    dates.reduce((result, date, index) => {
      if (index % 7 === 0) {
        result.push([date]);
        return result;
      } else {
        result[result.length - 1].push(date);
        return result;
      }
    }, [] as Date[][]),
  ];
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
    timeInputPage: 1,
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
  // eslint-disable-next-line
  const [dates, dateRows] = useMemo(() => getDatesAndRowsOfDates(), [
    todaysDate,
  ]);
  const [state, dispatch] = useReducer(
    reducer,
    { initialFreeTimes, dates },
    initializeState
  );
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

  return (
    <>
      {
        <div
          className="calendar"
          onPointerLeave={() => dispatch({ type: CELL_UP })}
        >
          <span />
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span />
          {dateRows
            .slice(0 + 4 * state.page, 4 + 4 * state.page)
            .map((row, rowIndex) => (
              <Row
                key={row[0].getTime()}
                dates={row}
                rowIndex={rowIndex}
                cellsToHighlight={state.cellsToHighlight}
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
            ))}
        </div>
      }

      {!state.selectDates && hasSelectedDates && state.dateSelected !== null && (
        <TimeSelector
          date={state.dateSelected}
          state={
            {
              pointerDown: state.pointerDown,
              cellsToHighlight: state.timeInputCellsToHighlight.get(
                state.dateSelected
              ),
              timeInputPage: state.timeInputPage,
              initialDateTimeDown: state.initialDateTimeDown,
            } as TimeInputState
          }
          dispatch={dispatch}
        />
      )}
      {state.selectDates && (
        <>
          <button
            type="button"
            className="back-btn"
            onClick={() =>
              dispatch({
                type: state.selectDates ? MOVE_BACK : TIME_INPUT_MOVE_BACK,
              })
            }
          >
            Back
          </button>
          <button
            type="button"
            className="forward-btn"
            onClick={() =>
              dispatch({
                type: state.selectDates
                  ? MOVE_FORWARD
                  : TIME_INPUT_MOVE_FORWARD,
              })
            }
          >
            Forward
          </button>
        </>
      )}
      {state.selectDates ? (
        <button
          type="button"
          className="select-btn"
          onClick={() => dispatch({ type: SELECT_TIMES })}
        >
          Select times
        </button>
      ) : (
        <button
          type="button"
          className="select-btn"
          onClick={() => dispatch({ type: SELECT_DATES })}
        >
          Select dates
        </button>
      )}
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
