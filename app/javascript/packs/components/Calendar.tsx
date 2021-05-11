import React, { useReducer, useMemo } from "react";
import { TimeSelector } from "./TimeSelector";

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
  selectDates: boolean;
  cellsToHighlight: Map<Date, boolean>;
  cellDown: Date | null;
  fromDate: Date | null;
  page: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  timeInputPage: TimeInputPage;
  dateSelected: Date | null;
  pointerDown: boolean;
  timeInputCellsToHighlight: Map<Date, Map<string, boolean>>;
  initialDateTimeDown: string | null;
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
  page: TimeInputPage;
  initialDateTimeDown: string | null;
}

const initialTimeInputState: TimeInputState = {
  pointerDown: false,
  cellsToHighlight: new Map<string, boolean>(),
  page: 1,
  initialDateTimeDown: null,
};

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

type ReducerAction =
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
        today.setHours(3, 0, 0, 0);
        if (action.date >= today) {
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

const initialState = {
  selectDates: true,
  cellsToHighlight: new Map<Date, boolean>(),
  cellDown: null as Date | null,
  fromDate: null,
  page: 0,
  timeInputPage: 1,
  dateSelected: null,
  timeInputCellsToHighlight: new Map<Date, Map<string, boolean>>(),
  pointerDown: false,
  initialDateTimeDown: null,
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
  const selectedDates = Array.from(state.cellsToHighlight.entries())
    .filter(([_, isSelected]) => isSelected)
    .map(([date, _]) => date);
  const hasSelectedDates = selectedDates.length > 0;

  return (
    <div className="calendar-container">
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
        </div>
      }

      {!state.selectDates && hasSelectedDates && state.dateSelected !== null && (
        <TimeSelector
          date={state.dateSelected}
          state={{
            pointerDown: state.pointerDown,
            cellsToHighlight: state.timeInputCellsToHighlight.get(
              state.dateSelected
            ),
            timeInputPage: state.timeInputPage,
            initialDateTimeDown: state.initialDateTimeDown,
          }}
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
      {hasSelectedDates &&
        selectedDates.map((date) => (
          <input
            key={date.getTime()}
            type="hidden"
            name={"date[]"}
            value={date.toISOString()}
          />
        ))}
    </div>
  );
};

export { Calendar };
