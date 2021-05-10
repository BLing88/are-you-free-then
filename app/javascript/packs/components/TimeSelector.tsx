import React, { useReducer } from "react";

interface CellProps {
  startDateTime: Date;
  endDateTime: Date;
}

const Cell = ({ startDateTime, endDateTime }: CellProps) => {
  return (
    <div className="time-input-cell">
      <span className="hour-string">
        {startDateTime.getMinutes() === 0 &&
          startDateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
      </span>
    </div>
  );
};

interface TimeInputState {
  pointerDown: boolean;
  cellsToHighlight: Map<string, boolean>;
  page: 0 | 1 | 2;
  initialDateTimeDown: string | null;
}

const initialTimeInputState: TimeInputState = {
  pointerDown: false,
  cellsToHighlight: new Map<string, boolean>(),
  page: 1,
  initialDateTimeDown: null,
};

const POINTER_DOWN = "POINTER_DOWN";
interface PointerDownAction {
  type: typeof POINTER_DOWN;
  dateTime: string;
}

const ON_ENTER_CELL = "ON_ENTER_CELL";
interface EnterCellAction {
  type: typeof ON_ENTER_CELL;
  dateTime: string;
}

const POINTER_UP = "POINTER_UP";
interface PointerUpAction {
  type: typeof POINTER_UP;
}

type TimeInputReducerAction =
  | PointerDownAction
  | EnterCellAction
  | PointerUpAction;
const reducer = (
  state: TimeInputState,
  action: TimeInputReducerAction
): TimeInputState => {
  switch (action.type) {
    case POINTER_DOWN: {
      const oldHighlight = state.cellsToHighlight.get(action.dateTime);
      const newHighlight = oldHighlight === undefined ? true : !oldHighlight;
      const newCellsToHighlight = new Map(state.cellsToHighlight);
      newCellsToHighlight.set(action.dateTime, newHighlight);
      return {
        ...state,
        pointerDown: true,
        cellsToHighlight: newCellsToHighlight,
        initialDateTimeDown: action.dateTime,
      };
    }
    case ON_ENTER_CELL: {
      if (!state.pointerDown) return { ...state };

      const newHighlight = !!state.cellsToHighlight.get(
        state.initialDateTimeDown
      );

      const newCellsToHighlight = new Map(state.cellsToHighlight);
      newCellsToHighlight.set(action.dateTime, newHighlight);
      return {
        ...state,
        cellsToHighlight: newCellsToHighlight,
      };
    }
    case POINTER_UP:
      return {
        ...state,
        pointerDown: false,
        initialDateTimeDown: null,
      };
    default:
      return state;
  }
};

interface TimeInputProps {
  date: Date;
}

const numFifteenMinsInADay = 1440;
const TimeInput = ({ date }: TimeInputProps) => {
  const [state, dispatch] = useReducer(reducer, initialTimeInputState);
  const times = [] as Date[];

  for (let i = 0; i < numFifteenMinsInADay; i += 15) {
    date.setHours(Math.floor(i / 60));
    date.setMinutes(i % 60);
    times.push(new Date(date.getTime()));
  }
  const midnightNextDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0
  );
  return (
    <div onPointerLeave={() => dispatch({ type: POINTER_UP })}>
      {times.map((time, i) => {
        const shouldHighlight = !!state.cellsToHighlight.get(
          time.toISOString()
        );
        return (
          //<Cell
          // key={time.getTime()}
          //  startDateTime={time}
          //   endDateTime={i < times.length - 1 ? times[i + 1] : midnightNextDay}
          // />
          <div
            key={time.getTime()}
            className={`time-input-cell ${
              shouldHighlight ? "highlight-cell" : ""
            }`}
            onPointerDown={() =>
              dispatch({ type: POINTER_DOWN, dateTime: time.toISOString() })
            }
            onPointerEnter={() =>
              dispatch({ type: ON_ENTER_CELL, dateTime: time.toISOString() })
            }
            onPointerUp={() => dispatch({ type: POINTER_UP })}
            onPointerCancel={() => dispatch({ type: POINTER_UP })}
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
  );
};

interface TimeSelectorProps {
  dates: Date[];
}

const TimeSelector = ({ dates }: TimeSelectorProps): JSX.Element => {
  return (
    <div>
      <h2>Select times for {dates[0].toDateString()}</h2>
      <div className="time-selector">
        <TimeInput date={dates[0]} />
      </div>
    </div>
  );
};

export { TimeSelector };
