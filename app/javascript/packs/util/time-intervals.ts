const dayInMilliseconds = 86400000;
export const getDatesAndRowsOfDates = (): [Date[], Date[][], number[]] => {
  const today = new Date();
  today.setHours(3, 0, 0, 0);
  const dates = [today];

  // go to beginning of the current week
  for (let i = 1; i <= today.getDay(); i++) {
    dates.unshift(new Date(today.getTime() - i * dayInMilliseconds));
  }

  // go backwards adding dates until the 1st of the month
  //const numWeeksBefore = Math.floor(dates[0].getDate() / 7);
  const startOfThisWeek = dates[0];
  for (let i = 1; i < startOfThisWeek.getDate(); i++) {
    dates.unshift(new Date(startOfThisWeek.getTime() - i * dayInMilliseconds));
  }

  // add the days of the week before the 1st of the month
  const firstDate = dates[0];
  for (let i = 1; i <= firstDate.getDay(); i++) {
    dates.unshift(new Date(firstDate.getTime() - i * dayInMilliseconds));
  }
  for (let i = 1; i < 365; i++) {
    dates.push(new Date(today.getTime() + i * dayInMilliseconds));
  }

  const firstOfEachMonth = []; // contains the index of rows that contain the first of each month, in chronological order
  const dateRows = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (i % 7 === 0) {
      dateRows.push([date]);
    } else {
      dateRows[dateRows.length - 1].push(date);
    }

    if (date.getDate() === 1) {
      firstOfEachMonth.push(dateRows.length - 1);
    }
  }

  return [dates, dateRows, firstOfEachMonth];
};

export const endOfInterval = (
  dateTime: string,
  intervalInMilliseconds: number
): string => {
  // dateTime must be in simplified ISO 8601 calendar date extended format
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format
  return new Date(Date.parse(dateTime) + intervalInMilliseconds).toISOString();
};

type Interval = [string, string];

const fifteenMinutesInMilliseconds = 900000;
export const mergedIntervals = (intervalStartTimes: string[]): Interval[] => {
  intervalStartTimes.sort();
  const intervals: Interval[] = [];
  for (const startTime of intervalStartTimes) {
    const endTime = endOfInterval(startTime, fifteenMinutesInMilliseconds);
    if (intervals.length === 0) {
      intervals.push([startTime, endTime]);
    } else if (intervals[intervals.length - 1][1] >= startTime) {
      intervals[intervals.length - 1][1] = endTime;
    } else {
      intervals.push([startTime, endTime]);
    }
  }
  return intervals;
};

// times are in simplified ISO 8601 format
export const intervalIsLessThan = (
  startTimeA: string,
  endTimeA: string,
  startTimeB: string,
  endTimeB: string
): boolean => {
  if (startTimeA < startTimeB) {
    return true;
  } else if (
    startTimeA === startTimeB &&
    new Date(endTimeA).getTime() - new Date(startTimeA).getTime() <
      new Date(endTimeB).getTime() - new Date(startTimeB).getTime()
  ) {
    return true;
  } else {
    return false;
  }
};
