import moment from 'moment';

const SERVER_DATE_FORMAT = 'YYYY-MM-DD 00:00:00';
const SERVER_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @param onlyDate whether to omit the time component (default: true)
 * @returns formatted date string
 */
function convertDateToISO(date: Date, onlyDate = true): string | undefined {
  if (!(date instanceof Date)) {
    return undefined;
  }
  const _format = onlyDate ? SERVER_DATE_FORMAT : SERVER_DATE_TIME_FORMAT;
  return formatDate(date, _format);
}

/**
 * Converts ISO date string to JS Date object
 *
 * @param dateString iso date string
 * @returns js Date or undefined if input is empty
 */
function convertISOToDate(dateString: string): Date | undefined {
  if (!dateString || dateString.trim() === '') {
    return undefined;
  }
  return parseDate(dateString);
}

function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

function formatDate(date: Date, dateFormat: string): string {
  return moment(date).format(dateFormat);
}

function parseDate(dateString: string, dateFormat?: string): Date {
  return moment(dateString, dateFormat).toDate();
}

function add(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date {
  return moment(date).add(amount, unit).toDate();
}

function subtract(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date {
  return moment(date).subtract(amount, unit).toDate();
}

export const DateUtils = {
  format: formatDate,
  parse: parseDate,
  convertDateToISO,
  convertISOToDate,
  isValidDate,
  add,
  subtract
};
