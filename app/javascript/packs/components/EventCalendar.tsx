import React, { useReducer, useMemo, CSSProperties } from "react";
import { scaleLinear } from "d3-scale";
import { TimeSelector } from "./TimeSelector";
import { BackButton } from "./BackButton";
import {
  intervalIsLessThan,
  getDatesAndRowsOfDates,
} from "../util/time-intervals";
import { ForwardButton } from "./ForwardButton";
import {
  parseDateTime,
  parseDate,
  getDateTime,
} from "../util/calendar-helpers";

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

interface RowProps {
  dates: Date[];
  rowIndex: number;
  cellsToHighlight: string[];
  onPointerDown: (date: string) => void;
}

const Row = ({ dates, cellsToHighlight, onPointerDown }: RowProps) => {
  //const month = dates[0].toLocaleString("default", { month: "short" });
  //const year = dates[dates.length - 1].getFullYear();
  return (
    <>
      {/*<span className="calendar-month">{month}</span>*/}
      {dates.map((date, i) => {
        const formattedDate = formatDate(date);
        //const highlight = cellsToHighlight.get(formattedDate);
        return (
          <span
            className={`calendar-cell ${cellsToHighlight[i]}`}
            key={date.getTime()}
            onPointerDown={() => onPointerDown(formattedDate)}
          >
            {date.getDate()}
          </span>
        );
      })}
      {/*<span className="calendar-year">{year}</span>*/}
    </>
  );
};

interface EventTimesDisplayProps {
  dispatch: React.Dispatch<ReducerAction>;
  dateSelected: string;
  highlightClassName: (hour: number, min: number) => string;
  colorMap: (hour: number, min: number) => CSSProperties;
  availableParticipants: string[];
  unavailableParticipants: string[];
  totalParticipantCount: number;
  selectedTimeInterval: string;
}

// eslint-disable-next-line
const noop = () => {};

const timeIntervalStringFor = (time: string) => {
  const start = parseDateTime(time);

  const end = new Date(start.getTime() + 900000);
  return `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "numeric",
  })} to ${end.toLocaleTimeString([], { hour: "numeric", minute: "numeric" })}`;
};

const isSelectedChild = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    width="50%"
    height="50%"
  >
    <title>Suggested time</title>
    {/* Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -*/}
    <path
      fill="#510D63"
      d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"
    />
  </svg>
);

const EventTimesDisplay = ({
  dispatch,
  dateSelected,
  highlightClassName,
  colorMap,
  availableParticipants,
  unavailableParticipants,
  totalParticipantCount,
  selectedTimeInterval,
}: EventTimesDisplayProps) => {
  return (
    <div className="event-display">
      <TimeSelector
        date={parseDate(dateSelected)}
        title={"View times"}
        highlightClassName={highlightClassName}
        colorMap={colorMap}
        onPointerLeaveHandler={null}
        onPointerUpHandler={null}
        onPointerCancelHandler={null}
        onPointerDownHandler={noop}
        onPointerEnterHandler={(hour: number, min: number) => {
          dispatch({ type: "SELECT_TIME_INTERVAL", hour, min });
        }}
        className={"event-times-display"}
        isSelectedClassName={"suggested-time-cell"}
        isSelectedChild={isSelectedChild}
      />
      <ul className="participant-lists">
        <span className="time-string">
          {selectedTimeInterval.length > 10
            ? timeIntervalStringFor(selectedTimeInterval)
            : "Select a time"}
        </span>
        <li>
          <h4>
            Available{" "}
            <small>
              ({`${availableParticipants.length}/${totalParticipantCount}`})
            </small>
          </h4>
          <ul className="available-participants-list">
            {availableParticipants.map((participant) => {
              return <li key={participant}>{participant}</li>;
            })}
          </ul>
        </li>
        <li>
          <h4>
            Unavailable{" "}
            <small>
              ({`${unavailableParticipants.length}/${totalParticipantCount}`})
            </small>
          </h4>
          <ul className="unavailable-participants-list">
            {unavailableParticipants.map((participant) => {
              return <li key={participant}>{participant}</li>;
            })}
          </ul>
        </li>
      </ul>
      <div className="time-input-back-btn">
        <button
          type="button"
          className="select-date-btn"
          onClick={() => dispatch({ type: SELECT_DATES })}
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface CalendarState {
  selectDates: boolean;
  cellsToHighlight: Map<string, boolean>;
  cellDown: string | null;
  fromDate: string | null;
  page: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  dateSelected: string | null;
  timeSelected: string | null;
  pointerDown: boolean;
  timeInputCellsToHighlight: Map<string, Map<string, string[]>>;
  suggestedTimes: Map<string, boolean>;
  initialDateTimeDown: string | null;
  timesParticipantsMap: Map<string, string[]>;
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

interface SelectTimeIntervalAction {
  type: "SELECT_TIME_INTERVAL";
  hour: number;
  min: number;
}

const MOVE_BACK = "MOVE_BACK";
const MOVE_FORWARD = "MOVE_FORWARD";

interface PaginateAction {
  type: typeof MOVE_FORWARD | typeof MOVE_BACK;
}

const SELECT_DATES = "SELECT_DATES";
interface SelectDatesAction {
  type: typeof SELECT_DATES;
}

export type ReducerAction =
  | ChangeSelectionAction
  | EnterCellAction
  | PointerUpAction
  | PaginateAction
  | SelectDatesAction
  | SelectTimeIntervalAction;

type NumberOfWeeks = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const reducer = (
  state: CalendarState,
  action: ReducerAction
): CalendarState => {
  switch (action.type) {
    case SET_CELL_DOWN: {
      if (
        state.dateSelected === null &&
        state.cellsToHighlight.get(action.date)
      ) {
        const newTimeInputCellsToHighlight = new Map(
          state.timeInputCellsToHighlight
        );
        if (!newTimeInputCellsToHighlight.has(action.date)) {
          newTimeInputCellsToHighlight.set(action.date, new Map());
        }
        return {
          ...state,
          dateSelected: action.date,
          selectDates: false,
          timeInputCellsToHighlight: newTimeInputCellsToHighlight,
        };
      } else if (state.selectDates) {
        return {
          ...state,
          cellDown: action.date,
        };
      } else {
        return { ...state };
      }
    }
    case "SELECT_TIME_INTERVAL": {
      const datetime = getDateTime(state.dateSelected, action.hour, action.min);
      return {
        ...state,
        timeSelected: datetime,
      };
    }
    case MOVE_FORWARD:
      return {
        ...state,
        page: (state.page < 12 ? state.page + 2 : 12) as NumberOfWeeks,
      };
    case MOVE_BACK:
      return {
        ...state,
        page: (state.page > 0 ? state.page - 2 : 0) as NumberOfWeeks,
      };
    case SELECT_DATES:
      return {
        ...state,
        selectDates: true,
        dateSelected: null,
        timeSelected: null,
      };
    default:
      return state;
  }
};
interface ParticipantInterval {
  start_time: Date;
  end_time: Date;
  participants: string[];
}
const fifteenMinsInMilliseconds = 900000;
const initializeState = ({
  suggestedTimes,
  participantTimes,
  dates,
}: {
  suggestedTimes: { start_time: Date; end_time: Date }[];
  participantTimes: ParticipantInterval[];
  dates: Date[];
}): CalendarState => {
  const initialState = {
    selectDates: true,
    cellsToHighlight: new Map<string, boolean>(),
    cellDown: null as string | null,
    fromDate: null,
    page: 0,
    dateSelected: null,
    timeSelected: null,
    timeInputCellsToHighlight: new Map<string, Map<string, string[]>>(),
    suggestedTimes: new Map<string, boolean>(),
    pointerDown: false,
    initialDateTimeDown: null,
    timesParticipantsMap: new Map<string, string[]>(),
  } as CalendarState;

  for (let { start_time, end_time } of suggestedTimes) {
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
        // initialState.timeInputCellsToHighlight.set(formattedDate, new Map());
      }
      //initialState.timeInputCellsToHighlight
      //  .get(formattedDate)
      //  .set(date.toISOString(), 1);
      initialState.suggestedTimes.set(date.toISOString(), true);
      date = new Date(date.getTime() + fifteenMinsInMilliseconds);
    }
  }

  // eslint-disable-next-line
  for (let { start_time, end_time, participants } of participantTimes) {
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
    const {
      cellsToHighlight,
      timeInputCellsToHighlight,
      timesParticipantsMap,
    } = initialState;
    while (date < end_time) {
      const formattedDate = formatDate(date);
      if (!cellsToHighlight.has(formattedDate)) {
        cellsToHighlight.set(formattedDate, true);
        timeInputCellsToHighlight.set(formattedDate, new Map());
      }
      if (!timeInputCellsToHighlight.has(formattedDate)) {
        timeInputCellsToHighlight.set(formattedDate, new Map());
      }
      const dateStr = date.toISOString();
      const timeInputCellsForDate =
        timeInputCellsToHighlight.get(formattedDate);
      if (!timeInputCellsForDate.has(dateStr)) {
        timeInputCellsForDate.set(dateStr, []);
      }
      for (const participant of participants) {
        timeInputCellsForDate.get(dateStr).push(participant);
      }
      timeInputCellsForDate.set(dateStr, timeInputCellsForDate.get(dateStr));
      timesParticipantsMap.set(dateStr, participants);
      date = new Date(date.getTime() + fifteenMinsInMilliseconds);
    }
  }
  return initialState;
};

const EventCalendar = (): JSX.Element => {
  const dataContainer = document.getElementById("react-event-calendar");
  const suggestedTimesDataset = dataContainer.dataset["suggestedTimes"];
  const suggestedTimes = useMemo(
    () =>
      JSON.parse(suggestedTimesDataset)
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
    [suggestedTimesDataset]
  );
  const participantTimesDataset = dataContainer.dataset["participantTimes"];
  const participantsDataset = JSON.parse(dataContainer.dataset["participants"]);
  const participantTimes = useMemo(
    () =>
      JSON.parse(participantTimesDataset).map(
        ({
          start_time,
          end_time,
          participants,
        }: {
          start_time: string;
          end_time: string;
          participants: string[];
        }) => ({
          start_time: new Date(start_time),
          end_time: new Date(end_time),
          participants,
        })
      ),
    [participantTimesDataset]
  );
  const participants: Set<string> = useMemo(() => {
    return new Set(participantsDataset);
  }, [participantsDataset]);
  const todaysDate = new Date().getDay();
  const [dates, dateRows, firstOfEachMonth] = useMemo(
    () => getDatesAndRowsOfDates(),
    // eslint-disable-next-line
    [todaysDate]
  );
  const [state, dispatch] = useReducer(
    reducer,
    { suggestedTimes, participantTimes, dates },
    initializeState
  );

  const selectedDates = Array.from(state.cellsToHighlight.entries())
    .filter(([_, isSelected]) => isSelected)
    .map(([date, _]) => date);
  const hasSelectedDates = selectedDates.length > 0;

  const highlightClassName = (hour: number, min: number) => {
    let className = "";
    const time = getDateTime(state.dateSelected, hour, min);
    if (state.timeInputCellsToHighlight.get(state.dateSelected)?.get(time)) {
      className += "highlight-cell ";
    }
    if (state.suggestedTimes.get(time)) {
      className += "suggested-time-cell ";
    }
    return className;
  };

  const colorMap = (hour: number, min: number) => {
    const time = getDateTime(state.dateSelected, hour, min);
    const maxNumberOverlapping = Math.max(
      ...Array.from(
        state.timeInputCellsToHighlight.get(state.dateSelected).values()
      ).map((arr) => arr.length)
    );
    const colorScale = scaleLinear<string>()
      .domain([1, maxNumberOverlapping])
      .range(["#cef1dd", "#34AD66"]);
    const style = { backgroundColor: "" } as CSSProperties;
    const count = state.timeInputCellsToHighlight
      .get(state.dateSelected)
      ?.get(time)?.length;
    if (count) {
      style.backgroundColor = colorScale(count);
    }
    if (time === state.timeSelected) {
      style.boxShadow = "0 0 4px 2px grey";
    }
    return style;
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

  const availableParticipants: string[] =
    state.timeInputCellsToHighlight
      .get(state.dateSelected)
      ?.get(state.timeSelected) ?? [];
  const unavailableParticipants = state.timeSelected
    ? Array.from(participants).filter(
        (participant) =>
          !state.timeInputCellsToHighlight
            .get(state.dateSelected)
            ?.get(state.timeSelected)
            ?.includes(participant)
      )
    : [];

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
                />
              );
            })}
        </div>
      </div>

      {!state.selectDates &&
        hasSelectedDates &&
        state.dateSelected !== null && (
          <EventTimesDisplay
            dispatch={dispatch}
            highlightClassName={highlightClassName}
            colorMap={colorMap}
            dateSelected={state.dateSelected}
            availableParticipants={availableParticipants}
            unavailableParticipants={unavailableParticipants}
            totalParticipantCount={participants.size}
            selectedTimeInterval={state.timeSelected ?? state.dateSelected}
          />
        )}
      {state.selectDates && (
        <div className="btns">
          {state.page > 0 && (
            <BackButton
              onClickHandler={() =>
                dispatch({
                  type: MOVE_BACK,
                })
              }
            />
          )}
          {state.page < 10 && (
            <ForwardButton
              onClickHandler={() =>
                dispatch({
                  type: MOVE_FORWARD,
                })
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export { EventCalendar };
