import React, {
  useReducer,
  useMemo,
  Dispatch,
  useRef,
  PointerEvent,
} from "react";
import { TimeSelector } from "./TimeSelector";
import {
  mergedIntervals,
  intervalIsLessThan,
  getDatesAndRowsOfDates,
} from "../util/time-intervals";
import { BackButton } from "./BackButton";
import { ForwardButton } from "./ForwardButton";
import {
  getDateFromDateString,
  getMonthFromDate,
  getYearFromDate,
  formatDate,
  getRectangularSelection,
  addDatesToHighlight,
  parseDateTime,
  getNewAndDeleteIntervals,
  getDateTime,
  parseDate,
} from "../util/calendar-helpers";

interface RowProps {
  dates: Date[];
  rowIndex: number;
  cellsToHighlight: string[];
  onPointerDown: (date: string) => void;
  onPointerUp: (date: string) => void;
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
        const today = new Date();
        const isToday =
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
        // const highlight = cellsToHighlight.get(formattedDate);
        return (
          <span
            className={`calendar-cell ${cellsToHighlight[i]} ${
              isToday ? "today" : ""
            }`}
            key={date.getTime()}
            onPointerDown={(e: PointerEvent<HTMLSpanElement>) => {
              //e.preventDefault();
              (e.target as HTMLSpanElement).releasePointerCapture(e.pointerId);
              onPointerDown(formattedDate);
            }}
            onPointerUp={() => onPointerUp(formattedDate)}
            onPointerEnter={(e) => {
              e.preventDefault();
              onPointerEnter(formattedDate);
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              onPointerLeave(formattedDate);
            }}
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
  originalCellsToHighlight: Map<string, boolean>;
  cellDown: string | null;
  fromDate: string | null;
  page: NumberOfPages;
  datesSelected: string[];
  pointerDown: boolean;
  timeInputCellsToHighlight: Map<string, Map<string, boolean>>;
  originalTimeInputCellsToHighlight: Map<string, Map<string, boolean>> | null;
  initialDateTimeDown: string | null;
  showTimes: boolean;
  isLongPressing: boolean;
}

const actionTypes = {
  clickDate: "CLICK_DATE",
  longPressing: "LONG_PRESSING",
  cellUp: "CELL_UP",
  onEnterCell: "ON_ENTER_CELL",
  onPointerLeave: "ON_POINTER_LEAVE",
  moveBack: "MOVE_BACK",
  moveForward: "MOVE_FORWARD",
  selectTimes: "SELECT_TIMES",
  selectDates: "SELECT_DATES",
  timeInputPointerDown: "TIME_INPUT_POINTER_DOWN",
  timeInputPointerUp: "TIME_INPUT_POINTER_UP",
  timeInputOnEnterCell: "TIME_INPUT_ON_ENTER_CELL",
  calendarLeave: "CALENDAR_LEAVE",
} as const;

interface ChangeSelectionAction {
  type: typeof actionTypes.onPointerLeave;
  date: string;
}

interface ClickDateAction {
  type: typeof actionTypes.clickDate;
  date: string;
}

interface LongPressingAction {
  type: typeof actionTypes.longPressing;
  date: string;
}

interface EnterCellAction {
  type: typeof actionTypes.onEnterCell;
  date: string;
  dates: Date[];
}

interface PointerUpAction {
  type: typeof actionTypes.cellUp;
}

interface PaginateAction {
  type: typeof actionTypes.moveForward | typeof actionTypes.moveBack;
}

interface SelectTimesAction {
  type: typeof actionTypes.selectTimes;
}

interface SelectDatesAction {
  type: typeof actionTypes.selectDates;
}

interface TimeInputPointerDownAction {
  type: typeof actionTypes.timeInputPointerDown;
  //dateTime: string;
  hour: number;
  min: number;
}

interface TimeInputEnterCellAction {
  type: typeof actionTypes.timeInputOnEnterCell;
  //dateTime: string
  hour: number;
  min: number;
}

interface TimeInputPointerUpAction {
  type: typeof actionTypes.timeInputPointerUp;
}

export type ReducerAction =
  | ClickDateAction
  | LongPressingAction
  | ChangeSelectionAction
  | EnterCellAction
  | PointerUpAction
  | PaginateAction
  | SelectTimesAction
  | SelectDatesAction
  | TimeInputPointerDownAction
  | TimeInputEnterCellAction
  | TimeInputPointerUpAction;

interface CalendarMonthProps {
  dispatch: Dispatch<ReducerAction>;
  indexOfRowWithFirstDayOfMonth: number;
  dateRows: Date[][];
  cellsToHighlight: Map<string, boolean>;
  numRowsNeeded: number;
  isInGrid: (index: number, page: number, numRows: number) => boolean;
  dates: Date[];
  page: number;
}

export const CalendarMonth = ({
  dispatch,
  indexOfRowWithFirstDayOfMonth,
  dateRows,
  cellsToHighlight,
  numRowsNeeded,
  isInGrid,
  dates,
  page,
}: CalendarMonthProps): JSX.Element => {
  const endOfFirstWeek: Date = dateRows[0][6];
  const longPressRef = useRef<number | null>(null);
  return (
    <div className="calendar-grid">
      <p className="calendar-month">
        {endOfFirstWeek.toLocaleString("default", { month: "long" })}
      </p>
      <p className="calendar-year">{endOfFirstWeek.getFullYear()}</p>

      <div
        className="calendar"
        onPointerLeave={() => dispatch({ type: actionTypes.cellUp })}
      >
        {dateRows.map((row, rowIndex) => {
          const classNames = row.map((date, index) => {
            if (!cellsToHighlight.get(formatDate(date))) {
              return "";
            }
            let className =
              "calendar-highlight-cell " +
              (date.getMonth() !== endOfFirstWeek.getMonth()
                ? "not-same-month "
                : "");
            const indexInDatesArr =
              index + 7 * (indexOfRowWithFirstDayOfMonth + rowIndex);
            const onRightBoundary = index === 6;
            const onLeftBoundary = index === 0;
            const onTopBoundary = rowIndex === 0;
            const onBottomBoundary = rowIndex === numRowsNeeded - 1;
            const topCellSelected =
              isInGrid(indexInDatesArr - 7, page, numRowsNeeded) &&
              cellsToHighlight.get(formatDate(dates[indexInDatesArr - 7]));
            const bottomCellSelected =
              isInGrid(indexInDatesArr + 7, page, numRowsNeeded) &&
              cellsToHighlight.get(formatDate(dates[indexInDatesArr + 7]));
            const leftCellSelected =
              isInGrid(indexInDatesArr - 1, page, numRowsNeeded) &&
              cellsToHighlight.get(formatDate(dates[indexInDatesArr - 1]));
            const rightCellSelected =
              isInGrid(indexInDatesArr + 1, page, numRowsNeeded) &&
              cellsToHighlight.get(formatDate(dates[indexInDatesArr + 1]));
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
                longPressRef.current = window.setTimeout(() => {
                  dispatch({ type: actionTypes.longPressing, date });
                  longPressRef.current = null;
                }, 250);
                //dispatch({ type: actionTypes.setCellDown, date });
              }}
              onPointerEnter={(date: string) =>
                dispatch({ type: actionTypes.onEnterCell, date, dates })
              }
              onPointerUp={(date: string) => {
                if (longPressRef.current) {
                  // single click if timer hasn't been cleared yet
                  window.clearTimeout(longPressRef.current);
                  longPressRef.current = null;
                  dispatch({ type: actionTypes.clickDate, date });
                } else {
                  // long pressing
                  dispatch({ type: actionTypes.cellUp });
                }
              }}
              onPointerLeave={(date: string) => {
                //      if (longPressRef.current) {
                //        window.clearTimeout(longPressRef.current);
                //        longPressRef.current = null;
                //      }
                dispatch({ type: actionTypes.onPointerLeave, date });
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const dateForMultipleDatesSelected = "2000-01-01";
const reducer = (
  state: CalendarState,
  action: ReducerAction
): CalendarState => {
  switch (action.type) {
    case actionTypes.clickDate: {
      if (state.showTimes) {
        return { ...state };
      }
      // bring up time selector for date clicked on, highlighting the date if not already
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
        newMap.set(action.date, true);
      }

      // set time input cell map for the selected date
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
        cellsToHighlight: newMap,
        showTimes: true,
        datesSelected: [action.date],
        cellDown: null,
        timeInputCellsToHighlight: newTimeInputCellsToHighlight,
      };
    }
    case actionTypes.longPressing: {
      // you're selecting a date
      const newHighlight =
        state.cellsToHighlight.get(action.date) === undefined
          ? true
          : !state.cellsToHighlight.get(action.date);
      const newMap = new Map(state.cellsToHighlight);
      const today = new Date();
      // set to 3 AM for comparison to avoid issues with DST
      //today.setHours(3, 0, 0, 0);
      const isNotInPast =
        getYearFromDate(action.date) > today.getFullYear() ||
        (getYearFromDate(action.date) === today.getFullYear() &&
          (getMonthFromDate(action.date) > today.getMonth() ||
            (getMonthFromDate(action.date) === today.getMonth() &&
              getDateFromDateString(action.date) >= today.getDate())));
      if (isNotInPast) {
        newMap.set(action.date, newHighlight);
        return {
          ...state,
          isLongPressing: true,
          cellDown: action.date,
          cellsToHighlight: newMap,
          originalCellsToHighlight: new Map(state.cellsToHighlight),
        };
      } else {
        return {
          ...state,
        };
      }
    }
    case actionTypes.onPointerLeave:
      if (state.cellDown !== null) {
        return {
          ...state,
          fromDate: action.date,
        };
      }
      return state;
    case actionTypes.cellUp: {
      if (!state.isLongPressing || state.showTimes) {
        // when leaving calendar, only change state when
        // long pressing and not showing times
        return { ...state };
      }
      const newTimeInputCellsToHighlight = new Map(
        state.timeInputCellsToHighlight
      );
      const selectedSingleDate =
        !state.fromDate || state.datesSelected.length === 0;
      if (
        selectedSingleDate &&
        !state.timeInputCellsToHighlight.has(state.cellDown)
      ) {
        // if longPressing a single date
        newTimeInputCellsToHighlight.set(state.cellDown, new Map());
      }
      return {
        ...state,
        isLongPressing: false,
        cellDown: null,
        fromDate: null,
        showTimes:
          // only show times if you have long pressed and the initial date is being selected
          // note that the initial date (cellDown) was already set to be highlighted
          // in the longPressing action preceding the cellUp action
          state.isLongPressing && state.cellsToHighlight.get(state.cellDown),
        // if long pressing just one date the time selector should show
        datesSelected: selectedSingleDate
          ? [state.cellDown]
          : state.datesSelected,
        timeInputCellsToHighlight: newTimeInputCellsToHighlight,
      };
    }
    case actionTypes.onEnterCell:
      if (state.showTimes) {
        return { ...state };
      }
      if (state.cellDown !== null && state.fromDate !== null) {
        const rectangularSelection = getRectangularSelection(
          state.cellDown,
          action.date,
          action.dates
        );

        const newTimeInputCellsToHighlight = new Map(
          state.timeInputCellsToHighlight
        );
        const datesSelected = rectangularSelection.map((date) =>
          formatDate(date)
        );
        for (const date of datesSelected) {
          if (!newTimeInputCellsToHighlight.has(date)) {
            newTimeInputCellsToHighlight.set(date, new Map());
          }
        }
        return {
          ...state,
          cellsToHighlight: addDatesToHighlight(
            new Map(state.originalCellsToHighlight),
            rectangularSelection,
            state.cellsToHighlight.get(state.cellDown)
          ),
          datesSelected,
          timeInputCellsToHighlight: newTimeInputCellsToHighlight,
        };
      } else {
        return state;
      }
    case actionTypes.moveForward:
      return {
        ...state,
        page: (state.page < 12 ? state.page + 2 : 12) as NumberOfPages,
      };
    case actionTypes.moveBack:
      return {
        ...state,
        page: (state.page > 0 ? state.page - 2 : 0) as NumberOfPages,
      };
    case actionTypes.selectTimes:
      return {
        ...state,
        selectDates: false,
      };
    case actionTypes.selectDates: {
      const newMap = new Map(state.cellsToHighlight);
      for (const date of state.datesSelected) {
        if (state.timeInputCellsToHighlight.get(date).size === 0) {
          newMap.set(date, false);
        }
      }

      // reset times for multiple-date-selection dummy date
      const newTimeInputCellsToHighlight = new Map(
        state.timeInputCellsToHighlight
      );
      if (state.datesSelected.length > 1) {
        newTimeInputCellsToHighlight.set(
          dateForMultipleDatesSelected,
          new Map()
        );
      }

      return {
        ...state,
        //selectDates: true,
        showTimes: false,
        datesSelected: [],
        cellsToHighlight: newMap,
        timeInputCellsToHighlight: newTimeInputCellsToHighlight,
      };
    }
    case actionTypes.timeInputPointerDown: {
      // either a specific date is selected or multiple dates
      const date =
        state.datesSelected.length === 1
          ? state.datesSelected[0]
          : dateForMultipleDatesSelected;
      const dateStr = getDateTime(date, action.hour, action.min);
      const oldHighlight = state.timeInputCellsToHighlight
        .get(date)
        .get(dateStr);

      const newHighlight = oldHighlight === undefined ? true : !oldHighlight;
      const newCellsToHighlight = new Map(state.timeInputCellsToHighlight);
      for (const date of state.datesSelected) {
        if (!newCellsToHighlight.has(date)) {
          newCellsToHighlight.set(date, new Map());
        }
      }
      if (newHighlight) {
        newCellsToHighlight.get(date).set(dateStr, newHighlight);

        // also update actual dates selected
        const hour = parseDateTime(dateStr).getHours(); //+dateStr.slice(11, 13);
        const min = parseDateTime(dateStr).getMinutes(); //+dateStr.slice(14, 16);
        for (const date of state.datesSelected) {
          const dateObj = parseDate(date);
          dateObj.setHours(hour);
          dateObj.setMinutes(min);
          newCellsToHighlight
            .get(date)
            .set(dateObj.toISOString(), newHighlight);
        }
      } else {
        newCellsToHighlight.get(date).delete(dateStr);
      }
      return {
        ...state,
        pointerDown: true,
        originalTimeInputCellsToHighlight: new Map(
          state.timeInputCellsToHighlight
        ),
        timeInputCellsToHighlight: newCellsToHighlight,
        initialDateTimeDown: dateStr,
      };
    }
    case actionTypes.timeInputOnEnterCell: {
      if (!state.pointerDown) return { ...state };

      const date =
        state.datesSelected.length === 1
          ? state.datesSelected[0]
          : dateForMultipleDatesSelected;
      const dateStr = getDateTime(date, action.hour, action.min);

      const newHighlight = !!state.timeInputCellsToHighlight
        .get(date)
        .get(state.initialDateTimeDown);

      // need to make copies of maps to avoid issues with
      // mutability
      const newCellsToHighlight = new Map(
        state.originalTimeInputCellsToHighlight
      );
      for (const [date, map] of newCellsToHighlight.entries()) {
        newCellsToHighlight.set(date, new Map(map));
      }
      const timeEntered = parseDateTime(dateStr);
      const initialTimeSelected = parseDateTime(state.initialDateTimeDown);
      const earlierTime =
        timeEntered.getTime() > initialTimeSelected.getTime()
          ? initialTimeSelected
          : timeEntered;
      const laterTime =
        timeEntered.getTime() > initialTimeSelected.getTime()
          ? timeEntered
          : initialTimeSelected;
      for (
        let time = earlierTime.getTime();
        time <= laterTime.getTime();
        time += fifteenMinsInMilliseconds
      ) {
        const datetime = new Date(time); //.toISOString();
        newCellsToHighlight.get(date).set(datetime.toISOString(), newHighlight);

        // also update actual dates selected
        const hour = datetime.getHours(); // +datetime.slice(11, 13);
        const min = datetime.getMinutes(); //.slice(14, 16);
        for (const date of state.datesSelected) {
          if (!newCellsToHighlight.has(date)) {
            newCellsToHighlight.set(date, new Map());
          }
          const dateMap = newCellsToHighlight.get(date);
          const dateObj = parseDate(date);
          dateObj.setHours(hour);
          dateObj.setMinutes(min);

          const dateStr = dateObj.toISOString();
          if (newHighlight) {
            dateMap.set(dateStr, newHighlight);
          } else {
            dateMap.delete(dateStr);
          }
        }
      }

      return {
        ...state,
        timeInputCellsToHighlight: newCellsToHighlight,
      };
    }
    case actionTypes.timeInputPointerUp:
      return {
        ...state,
        pointerDown: false,
        initialDateTimeDown: null,
        originalTimeInputCellsToHighlight: null,
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
    datesSelected: [],
    timeInputCellsToHighlight: new Map<string, Map<string, boolean>>(),
    pointerDown: false,
    initialDateTimeDown: null,
    showTimes: false,
    isLongPressing: false,
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

  initialState.timeInputCellsToHighlight.set(
    dateForMultipleDatesSelected,
    new Map()
  );
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
  const updateBtnMessage: string =
    document.getElementById("react-calendar-input").dataset.updateBtnMessage ??
    "Submit";
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
  const onTimeInputPointerDownHandler = (hour: number, min: number) =>
    dispatch({ type: actionTypes.timeInputPointerDown, hour, min });
  const onTimeInputPointerEnterHandler = (hour: number, min: number) =>
    dispatch({ type: actionTypes.timeInputOnEnterCell, hour, min });
  const onTimeInputPointerUpOrLeaveHandler = () =>
    dispatch({ type: actionTypes.timeInputPointerUp });

  const selectedDates = Array.from(state.cellsToHighlight.entries())
    .filter(([_, isSelected]) => isSelected)
    .map(([date, _]) => date);

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
  const [newTimeIntervals, deleteTimeIntervals] = getNewAndDeleteIntervals(
    selectedTimeIntervals,
    initialFreeTimes
  );

  const highlightClassName = (hour: number, min: number) => {
    let className = "";
    if (state.datesSelected.length === 1) {
      const time = getDateTime(state.datesSelected[0], hour, min);
      if (
        state.timeInputCellsToHighlight.get(state.datesSelected[0])?.get(time)
      ) {
        className += "highlight-cell";
      }
    } else if (
      state.timeInputCellsToHighlight.get(dateForMultipleDatesSelected)
    ) {
      // choose the date 2000-01-01 to act as a dummy date for multiple dates selected
      if (
        state.timeInputCellsToHighlight
          .get(dateForMultipleDatesSelected)
          .get(getDateTime(dateForMultipleDatesSelected, hour, min))
      ) {
        className += "highlight-cell";
      }
    }
    return className;
  };

  // the number of rows for each month can vary depending on the number of days in
  // the month and what day the first day of the month is (max when first is a Sunday
  // and there are 31 days)
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
      <CalendarMonth
        dispatch={dispatch}
        indexOfRowWithFirstDayOfMonth={firstOfEachMonth[state.page]}
        dateRows={dateRows.slice(
          firstOfEachMonth[state.page],
          numRowsFirstMonth + firstOfEachMonth[state.page]
        )}
        cellsToHighlight={state.cellsToHighlight}
        numRowsNeeded={numRowsFirstMonth}
        isInGrid={isInGrid}
        dates={dates}
        page={state.page}
      />
      <CalendarMonth
        dispatch={dispatch}
        indexOfRowWithFirstDayOfMonth={firstOfEachMonth[state.page + 1]}
        dateRows={dateRows.slice(
          firstOfEachMonth[state.page + 1],
          numRowsSecondMonth + firstOfEachMonth[state.page + 1]
        )}
        cellsToHighlight={state.cellsToHighlight}
        numRowsNeeded={numRowsSecondMonth}
        isInGrid={isInGrid}
        dates={dates}
        page={state.page + 1}
      />

      {
        //!state.selectDates && hasSelectedDates && state.dateSelected !== null && (
        state.showTimes && (
          <TimeSelector
            date={
              state.datesSelected.length === 1
                ? parseDate(state.datesSelected[0])
                : null
            }
            title={"Select times"}
            highlightClassName={highlightClassName}
            onPointerLeaveHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerUpHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerCancelHandler={onTimeInputPointerUpOrLeaveHandler}
            onPointerDownHandler={onTimeInputPointerDownHandler}
            onPointerEnterHandler={onTimeInputPointerEnterHandler}
            className={"time-selector"}
          >
            <button
              type="button"
              className="select-date-btn"
              onClick={() => dispatch({ type: actionTypes.selectDates })}
            >
              Close
            </button>
          </TimeSelector>
        )
      }
      {state.selectDates && (
        <div className="btns">
          {state.page > 0 && (
            <BackButton
              onClickHandler={() =>
                dispatch({
                  type: actionTypes.moveBack,
                })
              }
            />
          )}

          <input
            className="submit-btn"
            type="submit"
            name="commit"
            value={updateBtnMessage}
            data-disable-with="Update"
          />

          {state.page < 10 && (
            <ForwardButton
              onClickHandler={() =>
                dispatch({
                  type: actionTypes.moveForward,
                })
              }
            />
          )}
        </div>
      )}

      {!state.selectDates && state.datesSelected.length === 0 && (
        <div className="date-select-message">
          <span>Select a date to view</span>
          <BackButton
            onClickHandler={() => dispatch({ type: actionTypes.selectDates })}
          />
        </div>
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
