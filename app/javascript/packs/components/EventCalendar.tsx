import React, { useReducer, useMemo } from "react";
import { TimeSelector } from "./TimeSelector";
import { BackButton } from "./BackButton";
import {
  intervalIsLessThan,
  getDatesAndRowsOfDates,
} from "../util/time-intervals";
import { ForwardButton } from "./ForwardButton";

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

interface CalendarState {
  selectDates: boolean;
  cellsToHighlight: Map<string, boolean>;
  cellDown: string | null;
  fromDate: string | null;
  page: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  dateSelected: string | null;
  pointerDown: boolean;
  timeInputCellsToHighlight: Map<string, Map<string, number>>;
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
  | SelectDatesAction;

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
        return {
          ...state,
          dateSelected: action.date,
          selectDates: false,
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
    timeInputCellsToHighlight: new Map<string, Map<string, number>>(),
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
      const timeInputCellsForDate = timeInputCellsToHighlight.get(
        formattedDate
      );
      timeInputCellsForDate.set(
        dateStr,
        timeInputCellsForDate.get(dateStr)
          ? timeInputCellsForDate.get(dateStr) + 1
          : 1
      );
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
  const participantTimes = useMemo(
    () =>
      JSON.parse(participantTimesDataset).map(
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
      ),
    [participantTimesDataset]
  );
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
  const highlightClassName = (time: string) => {
    let className = "";
    if (state.timeInputCellsToHighlight.get(state.dateSelected)?.get(time)) {
      className += "highlight-cell ";
    }
    if (state.suggestedTimes.get(time)) {
      className += "suggested-time-cell ";
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

      {!state.selectDates && hasSelectedDates && state.dateSelected !== null && (
        <TimeSelector
          date={state.dateSelected}
          title={"View times"}
          highlightClassName={highlightClassName}
          onPointerLeaveHandler={null}
          onPointerUpHandler={null}
          onPointerCancelHandler={null}
          onPointerDownHandler={null}
          onPointerEnterHandler={null}
        >
          <button
            type="button"
            className="select-btn"
            onClick={() => dispatch({ type: SELECT_DATES })}
          >
            Back
          </button>
        </TimeSelector>
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
          {state.page < 12 && (
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
