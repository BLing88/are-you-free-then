const dayInMilliseconds = 86400000;
export const getDatesAndRowsOfDates = (): [Date[], Date[][]] => {
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
