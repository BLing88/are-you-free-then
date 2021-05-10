import React, { useReducer, useMemo } from "react";

interface RowProps {
  dates: Date[];
  rowIndex: number;
  cellsToHighlight: Map<Date, boolean>;
  onPointerDown: (date: Date) => void;
  onPointerUp: () => void;
  onPointerEnter: (date: Date) => void;
  onPointerLeave: (date: Date) => void;
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
        const highlight = !!cellsToHighlight.get(date);
        return (
          <span
            className="calendar-cell"
            key={date.getTime()}
            onPointerDown={() => onPointerDown(date)}
            onPointerUp={onPointerUp}
            onPointerEnter={() => onPointerEnter(date)}
            onPointerLeave={() => onPointerLeave(date)}
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
  cellsToHighlight: Map<Date, boolean>;
  cellDown: Date | null;
  fromDate: Date | null;
  page: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const SET_CELL_DOWN = "SET_CELL_DOWN";
const CELL_UP = "CELL_UP";
const ON_ENTER_CELL = "ON_ENTER_CELL";
const ON_POINTER_LEAVE = "ON_POINTER_LEAVE";
interface ChangeSelectionAction {
  type: typeof SET_CELL_DOWN | typeof ON_POINTER_LEAVE;
  date: Date;
}

interface EnterCellAction {
  type: typeof ON_ENTER_CELL;
  date: Date;
  dateRows: Date[][];
}

interface PointerUpAction {
  type: typeof CELL_UP;
}

const MOVE_BACK = "MOVE_BACK";
const MOVE_FORWARD = "MOVE_FORWARD";

interface PaginateAction {
  type: typeof MOVE_FORWARD | typeof MOVE_BACK;
}

type ReducerAction =
  | ChangeSelectionAction
  | EnterCellAction
  | PointerUpAction
  | PaginateAction;

type NumberOfWeeks = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const reducer = (
  state: CalendarState,
  action: ReducerAction
): CalendarState => {
  switch (action.type) {
    case SET_CELL_DOWN: {
      const newHighlight =
        state.cellsToHighlight.get(action.date) === undefined
          ? true
          : !state.cellsToHighlight.get(action.date);
      const newMap = new Map(state.cellsToHighlight);
      const today = new Date();
      // set to midnight for comparison
      today.setHours(3, 0, 0, 0);
      if (action.date >= today) {
        newMap.set(action.date, newHighlight);
      }
      return {
        ...state,
        cellsToHighlight: newMap,
        cellDown: action.date,
      };
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
          state.cellDown > state.fromDate ? state.fromDate : state.cellDown;
        const laterInitialDate =
          state.cellDown > state.fromDate ? state.cellDown : state.fromDate;
        const earlierFinalDate =
          state.cellDown > action.date ? action.date : state.cellDown;
        const laterFinalDate =
          state.cellDown > action.date ? state.cellDown : action.date;

        const firstInitialDayOfWeek = Math.min(
          earlierInitialDate.getDay(),
          laterInitialDate.getDay()
        );
        const lastInitialDayOfWeek = Math.max(
          earlierInitialDate.getDay(),
          laterInitialDate.getDay()
        );

        const firstFinalDayOfWeek = Math.min(
          earlierFinalDate.getDay(),
          laterFinalDate.getDay()
        );
        const lastFinalDayOfWeek = Math.max(
          earlierFinalDate.getDay(),
          laterFinalDate.getDay()
        );

        const symmetricDiff = action.dateRows.reduce((dates, dateRow) => {
          for (const date of dateRow) {
            const dayOfWeek = date.getDay();
            const initialIsWithinDays =
              firstInitialDayOfWeek <= dayOfWeek &&
              dayOfWeek <= lastInitialDayOfWeek;
            const initialIsWithinWeeks =
              earlierInitialDate.getTime() <= date.getTime() &&
              date.getTime() <= laterInitialDate.getTime();
            const finalIsWithinDays =
              firstFinalDayOfWeek <= dayOfWeek &&
              dayOfWeek <= lastFinalDayOfWeek;
            const finalIsWithinWeeks =
              earlierFinalDate.getTime() <= date.getTime() &&
              date.getTime() <= laterFinalDate.getTime();
            if (
              (initialIsWithinDays && initialIsWithinWeeks) !==
              (finalIsWithinDays && finalIsWithinWeeks)
            ) {
              dates.push(date);
            }
          }
          return dates;
        }, [] as Date[]);

        const today = new Date();
        // set to midnight
        today.setHours(3, 0, 0, 0);
        for (const date of symmetricDiff) {
          if (date >= today) {
            newMap.set(date, !!state.cellsToHighlight.get(state.cellDown));
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
    default:
      return state;
  }
};

const initialState = {
  cellsToHighlight: new Map<Date, boolean>(),
  cellDown: null as Date | null,
  fromDate: null,
  page: 0,
} as CalendarState;

const getRowsOfDates = () => {
  const today = new Date();
  today.setHours(3, 0, 0, 0);
  const dates = [today];
  for (let i = 1; i <= today.getDay(); i++) {
    dates.unshift(new Date(today.getTime() - i * dayInMilliseconds));
  }
  for (let i = 1; i < 365; i++) {
    dates.push(new Date(today.getTime() + i * dayInMilliseconds));
  }

  return dates.reduce((result, date, index) => {
    if (index % 7 === 0) {
      result.push([date]);
      return result;
    } else {
      result[result.length - 1].push(date);
      return result;
    }
  }, [] as Date[][]);
};

const Calendar = (): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const todaysDate = new Date().getDay();
  // eslint-disable-next-line
  const dateRows = useMemo(() => getRowsOfDates(), [todaysDate]);
  return (
    <>
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
              onPointerDown={(date: Date) => {
                dispatch({ type: SET_CELL_DOWN, date });
              }}
              onPointerEnter={(date: Date) =>
                dispatch({ type: ON_ENTER_CELL, date, dateRows })
              }
              onPointerUp={() => {
                dispatch({ type: CELL_UP });
              }}
              onPointerLeave={(date: Date) =>
                dispatch({ type: ON_POINTER_LEAVE, date })
              }
            />
          ))}
        {Array.from(state.cellsToHighlight.entries()).map(
          ([date, isSelected]) =>
            isSelected && (
              <input
                key={date.getTime()}
                type="hidden"
                name={"date[]"}
                value={date.toISOString()}
              />
            )
        )}
      </div>
      <button onClick={() => dispatch({ type: MOVE_BACK })}>Back</button>
      <button onClick={() => dispatch({ type: MOVE_FORWARD })}>Forward</button>
      <button>Select times</button>
    </>
  );
};

export { Calendar };
