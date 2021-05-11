import React from "react";

type TimeInputPage = 0 | 1 | 2;

interface TimeInputState {
  pointerDown: boolean;
  cellsToHighlight: Map<string, boolean>;
  timeInputPage: TimeInputPage;
  initialDateTimeDown: string | null;
}

const TIME_INPUT_POINTER_DOWN = "TIME_INPUT_POINTER_DOWN";

const TIME_INPUT_ON_ENTER_CELL = "TIME_INPUT_ON_ENTER_CELL";

const TIME_INPUT_POINTER_UP = "TIME_INPUT_POINTER_UP";

const TIME_INPUT_MOVE_FORWARD = "TIME_INPUT_MOVE_FORWARD";
const TIME_INPUT_MOVE_BACK = "TIME_INPUT_MOVE_BACK";

interface TimeSelectorProps {
  date: Date;
  state: TimeInputState;
  dispatch: any;
}

const numFifteenMinsInADay = 1440;
const TimeSelector = ({
  date,
  state,
  dispatch,
}: TimeSelectorProps): JSX.Element => {
  // const [state, dispatch] = useReducer(reducer, initialTimeInputState);
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
    <>
      <div
        className="time-selector-input"
        onPointerLeave={() => dispatch({ type: TIME_INPUT_POINTER_UP })}
      >
        <h2>Select times for {date.toDateString()}</h2>
        {times
          .slice(state.timeInputPage * 32, state.timeInputPage * 32 + 32)
          .map((time, i) => {
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
                  dispatch({
                    type: TIME_INPUT_POINTER_DOWN,
                    dateTime: time.toISOString(),
                  })
                }
                onPointerEnter={() =>
                  dispatch({
                    type: TIME_INPUT_ON_ENTER_CELL,
                    dateTime: time.toISOString(),
                  })
                }
                onPointerUp={() => dispatch({ type: TIME_INPUT_POINTER_UP })}
                onPointerCancel={() =>
                  dispatch({ type: TIME_INPUT_POINTER_UP })
                }
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
        onClick={() => dispatch({ type: TIME_INPUT_MOVE_BACK })}
      >
        Back
      </button>
      <button
        type="button"
        className="forward-btn"
        onClick={() => dispatch({ type: TIME_INPUT_MOVE_FORWARD })}
      >
        Forward
      </button>
    </>
  );
};

//interface TimeSelectorProps {
//  date: Date;
//  state: any;
//  dispatch: any;
//}

//const TimeSelector = ({
//  date,
//  state,
//  dispatch,
//}: TimeSelectorProps): JSX.Element => {
//  return (
//    <div>
//     <h2>Select times for {date.toDateString()}</h2>
//     <div className="time-selector">
//        <TimeInput date={date} state={state} dispatch={dispatch} />
//     </div>
//  </div>
// );
//};

export { TimeSelector };
