/**
 * Experience Calculator
 * Calculates non-overlapping professional employment duration across all roles.
 * Ensures overlapping jobs are never double-counted.
 */

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function parseDateToMonth(dateStr: string, isEndDate: boolean = false): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim().toLowerCase();

  // Handle current/ongoing indicators
  if (['present', 'current', 'now', 'ongoing', 'today', 'active'].includes(clean)) {
    const now = new Date();
    return now.getFullYear() * 12 + (now.getMonth() + 1);
  }

  // 1. Check for Month + Year (e.g. "Jan 2020", "January 2020", "01/2020", "2020-01")
  const monthYearMatch = clean.match(/([a-z]+|\d{1,2})[\s\/\-\.,]+(\d{4})/i);
  if (monthYearMatch) {
    const monthPart = monthYearMatch[1].toLowerCase();
    const yearPart = parseInt(monthYearMatch[2], 10);

    let month = 1;
    if (MONTH_NAMES[monthPart]) {
      month = MONTH_NAMES[monthPart];
    } else {
      const num = parseInt(monthPart, 10);
      if (num >= 1 && num <= 12) month = num;
    }

    if (yearPart >= 1970 && yearPart <= 2050) {
      return yearPart * 12 + month;
    }
  }

  // 2. Check for Year + Month (e.g. "2020-01", "2020/01")
  const yearMonthMatch = clean.match(/(\d{4})[\s\/\-\.,]+([a-z]+|\d{1,2})/i);
  if (yearMonthMatch) {
    const yearPart = parseInt(yearMonthMatch[1], 10);
    const monthPart = yearMonthMatch[2].toLowerCase();

    let month = 1;
    if (MONTH_NAMES[monthPart]) {
      month = MONTH_NAMES[monthPart];
    } else {
      const num = parseInt(monthPart, 10);
      if (num >= 1 && num <= 12) month = num;
    }

    if (yearPart >= 1970 && yearPart <= 2050) {
      return yearPart * 12 + month;
    }
  }

  // 3. Check for standalone 4-digit Year (e.g. "2020")
  const yearOnlyMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnlyMatch) {
    const yearPart = parseInt(yearOnlyMatch[1], 10);
    return isEndDate ? yearPart * 12 + 12 : yearPart * 12 + 1;
  }

  return null;
}

export interface ExperienceCalculationResult {
  totalMonths: number;
  years: number;
  formatted: string;
}

/**
 * Calculates total non-overlapping experience from an array of date ranges.
 */
export function calculateTotalExperience(
  experiences: Array<{ start_date?: string; end_date?: string; duration?: string }>
): ExperienceCalculationResult {
  if (!experiences || experiences.length === 0) {
    return { totalMonths: 0, years: 0, formatted: '0 months experience' };
  }

  interface MonthInterval {
    start: number;
    end: number;
  }

  const intervals: MonthInterval[] = [];

  for (const exp of experiences) {
    let startMonth = parseDateToMonth(exp.start_date || '', false);
    let endMonth = parseDateToMonth(exp.end_date || '', true);

    // If start_date/end_date are blank, attempt to parse duration string (e.g. "2019 - 2022")
    if ((!startMonth || !endMonth) && exp.duration) {
      const parts = exp.duration.split(/[-–—to]/i);
      if (parts.length >= 2) {
        if (!startMonth) startMonth = parseDateToMonth(parts[0], false);
        if (!endMonth) endMonth = parseDateToMonth(parts[1], true);
      }
    }

    if (startMonth && endMonth) {
      if (startMonth > endMonth) {
        const tmp = startMonth;
        startMonth = endMonth;
        endMonth = tmp;
      }
      intervals.push({ start: startMonth, end: endMonth });
    }
  }

  if (intervals.length === 0) {
    return { totalMonths: 0, years: 0, formatted: 'Experience duration not specified in resume' };
  }

  // Sort intervals chronologically by start date
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping or contiguous date ranges
  const merged: MonthInterval[] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const prev = merged[merged.length - 1];

    if (current.start <= prev.end + 1) {
      // Overlapping or touching periods — union them
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  // Sum total non-overlapping months
  let totalMonths = 0;
  for (const interval of merged) {
    totalMonths += Math.max(1, interval.end - interval.start + 1);
  }

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  let formatted = '';
  if (years > 0 && remainingMonths > 0) {
    formatted = `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} experience`;
  } else if (years > 0 && remainingMonths === 0) {
    formatted = `${years} ${years === 1 ? 'year' : 'years'} experience`;
  } else if (years === 0 && remainingMonths > 0) {
    formatted = `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} experience`;
  } else {
    formatted = 'Less than 1 month experience';
  }

  return {
    totalMonths,
    years: Number((totalMonths / 12).toFixed(1)),
    formatted,
  };
}
