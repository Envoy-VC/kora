/**
 * Helper function to get the date to the next hour in GMT
 * @param date The date to get the next hour for
 * @returns The next hour in GMT
 */
export const getNextHourInGMT = (date: Date): Date => {
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();

  const result = new Date(date);

  if (minute > 0) {
    result.setUTCHours(hour + 1, 0, 0, 0);
  } else {
    result.setUTCHours(hour, 0, 0, 0);
  }

  return result;
};

export const parseFrequencyDuration = (
  duration: number,
  unit: "hours" | "days" | "weeks" | "months" | "years",
): number => {
  const ONE_HOUR_IN_SECONDS = 3600;
  const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS * 24;
  const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
  const ONE_MONTH_IN_SECONDS = ONE_DAY_IN_SECONDS * 30;
  const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS * 365;

  if (unit === "hours") {
    return duration * ONE_HOUR_IN_SECONDS;
  } else if (unit === "days") {
    return duration * ONE_DAY_IN_SECONDS;
  } else if (unit === "weeks") {
    return duration * ONE_WEEK_IN_SECONDS;
  } else if (unit === "months") {
    return duration * ONE_MONTH_IN_SECONDS;
  } else {
    return duration * ONE_YEAR_IN_SECONDS;
  }
};
