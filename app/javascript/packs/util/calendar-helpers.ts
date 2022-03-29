import { intervalIsLessThan } from "./time-intervals";

export function getDateFromDateString(str: string): number {
  return +str.slice(-2);
}

const dayFromDateMemo = new Map();
export function getDayFromDate(str: string): number {
  if (dayFromDateMemo.has(str)) {
    return dayFromDateMemo.get(str);
  }

  dayFromDateMemo.set(
    str,
    new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2)).getDay()
  );
  return dayFromDateMemo.get(str);
}

export function getMonthFromDate(str: string): number {
  return +str.slice(5, 7) - 1;
}

export function getYearFromDate(str: string): number {
  return +str.slice(0, 4);
}

const timeFromDateMemo = new Map();
export function getTimeFromDate(str: string): number {
  if (timeFromDateMemo.has(str)) return timeFromDateMemo.get(str);

  const date = new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2));
  date.setHours(3, 0, 0);
  timeFromDateMemo.set(str, date.getTime());

  return timeFromDateMemo.get(str);
}

export const parseDateTime = (str: string): Date => {
  const date = new Date();
  date.setUTCFullYear(+str.slice(0, 4));
  date.setUTCMonth(+str.slice(5, 7) - 1);
  date.setUTCDate(+str.slice(8, 10));
  date.setUTCHours(+str.slice(11, 13));
  date.setUTCMinutes(+str.slice(14, 16));
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
};

export const parseDate = (str: string): Date => {
  return new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(8, 10), 3);
};

export const formatDate = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

export const getSymmetricDiff = (
  fromDate: string,
  cellDown: string,
  enteredCell: string,
  dates: Date[]
): Date[] => {
  // calculate the cells added/removed when entering a cell, based
  // on cellDown, then only need to toggle the change (the symmetric difference of the final and initial rectangular selections)
  const earlierInitialDate =
    getTimeFromDate(cellDown) > getTimeFromDate(fromDate) ? fromDate : cellDown;
  const laterInitialDate =
    getTimeFromDate(cellDown) > getTimeFromDate(fromDate) ? cellDown : fromDate;
  const earlierFinalDate =
    getTimeFromDate(cellDown) > getTimeFromDate(enteredCell)
      ? enteredCell
      : cellDown;
  const laterFinalDate =
    getTimeFromDate(cellDown) > getTimeFromDate(enteredCell)
      ? cellDown
      : enteredCell;

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

  const symmetricDiff = dates.reduce((dates, date) => {
    const dayOfWeek = date.getDay();
    const initialIsWithinDays =
      firstInitialDayOfWeek <= dayOfWeek && dayOfWeek <= lastInitialDayOfWeek;
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

  return symmetricDiff;
};

export const getRectangularSelection = (
  cellDown: string,
  enteredCell: string,
  dates: Date[]
): Date[] => {
  const earlierDate =
    getTimeFromDate(cellDown) > getTimeFromDate(enteredCell)
      ? enteredCell
      : cellDown;
  const laterDate =
    getTimeFromDate(cellDown) > getTimeFromDate(enteredCell)
      ? cellDown
      : enteredCell;
  const firstDayOfWeek = Math.min(
    getDayFromDate(earlierDate),
    getDayFromDate(laterDate)
  );
  const lastDayOfWeek = Math.max(
    getDayFromDate(earlierDate),
    getDayFromDate(laterDate)
  );

  // top left corner of rectangular selection
  // earlierDate could be the top right corner if
  // selecting from top right to bottom left
  const firstDateOfRectangularSelection =
    getTimeFromDate(earlierDate) -
    (getDayFromDate(earlierDate) - firstDayOfWeek) * 86400000;
  // bottom right corner of rectangular selection
  // laterDate could be bottom left corner
  const lastDateOfRectangularSelection =
    getTimeFromDate(laterDate) +
    Math.abs(getDayFromDate(laterDate) - lastDayOfWeek) * 86400000;

  return dates.filter((date) => {
    const dayOfWeek = date.getDay();
    const isWithinDays =
      firstDayOfWeek <= dayOfWeek && dayOfWeek <= lastDayOfWeek;
    const isWithinWeeks =
      firstDateOfRectangularSelection <= date.getTime() &&
      date.getTime() <= lastDateOfRectangularSelection;

    return isWithinDays && isWithinWeeks;
  });
};

export const addDatesToHighlight = (
  baseMap: Map<string, boolean>,
  datesToMergeIn: Date[],
  highlight: boolean
): Map<string, boolean> => {
  const today = new Date();
  // set to 3 AM for comparison to avoid issues with DST
  today.setHours(3, 0, 0, 0);
  for (const date of datesToMergeIn) {
    if (date >= today) {
      baseMap.set(formatDate(date), highlight);
    }
  }
  return baseMap;
};
interface Interval {
  start_time: Date;
  end_time: Date;
}

export function getNewAndDeleteIntervals(
  selectedTimeIntervals: [string, string][],
  initialTimes: Interval[]
): [string[], Interval[]] {
  let deleteTimeIntervals = [];
  let newTimeIntervals = [];
  if (initialTimes.length === 0) {
    newTimeIntervals = selectedTimeIntervals.slice();
  } else if (selectedTimeIntervals.length === 0) {
    deleteTimeIntervals = initialTimes.slice();
  } else {
    let newTimesPointer = 0;
    let oldTimesPointer = 0;
    while (
      newTimesPointer < selectedTimeIntervals.length &&
      oldTimesPointer < initialTimes.length
    ) {
      const oldInterval = initialTimes[oldTimesPointer];
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
      oldTimesPointer < initialTimes.length
    ) {
      deleteTimeIntervals.splice(-1, 0, ...initialTimes.slice(oldTimesPointer));
    } else if (
      oldTimesPointer === initialTimes.length &&
      newTimesPointer < selectedTimeIntervals.length
    ) {
      newTimeIntervals.splice(
        -1,
        0,
        ...selectedTimeIntervals.slice(newTimesPointer)
      );
    }
  }
  return [newTimeIntervals, deleteTimeIntervals];
}

// getDateTime takes a string like  2021-03-23 and an hour and min
// where min is a multiple of 15 represent a start of a 15-min interval
// i.e. hour = 14 min = 15 represents 14:15 to 14:30
export function getDateTime(
  dateStr: string,
  hour: number,
  min: number
): string {
  const year = +dateStr.slice(0, 4);
  const month = +dateStr.slice(5, 7) - 1;
  const day = +dateStr.slice(8, 10);

  return new Date(year, month, day, hour, min, 0).toISOString();
}
