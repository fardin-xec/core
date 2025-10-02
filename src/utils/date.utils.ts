import { isEmpty } from 'lodash/lang';
import moment from 'moment';

const SERVER_DATE_FORMAT = 'YYYY-MM-DD 00:00:00';
const SERVER_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 *Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @returns ISO date string
 */
function convertDateToISO(date: Date, onlyDate = true): string {
  let dateString;
  if (date instanceof Date) {
    let _format = SERVER_DATE_TIME_FORMAT;
    if (onlyDate) {
      _format = SERVER_DATE_FORMAT;
    }
    dateString = format(date, _format); //moment(date).format(format);
  }
  return dateString;
}

/**
 *Converts ISO date string to JS Date object
 *
 * @param dateString iso date string
 * @returns js Date
 */
function convertISOToDate(dateString: string): Date {
  let date: Date;
  if (!isEmpty(dateString)) {
    date = parse(dateString); // moment(dateString).toDate() as Date;
  }
  return date;
}

function isValidDate(d: Date) {
  return d && d instanceof Date && !isNaN(d.getTime());
}

function format(date: Date, format: string) {
  return moment(date).format(format);
}

function parse(dateString: string, format?: string) {
  return moment(dateString, format).toDate() as Date;
}

function add(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year') {
  return moment(date).add(amount, unit).toDate();
}

function subtract(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year') {
  return moment(date).subtract(amount, unit).toDate();
}

export const DateUtils = {
  format: format,
  parse: parse,
  convertDateToISO: convertDateToISO,
  convertISOToDate: convertISOToDate,
  isValidDate: isValidDate,
  add: add,
  subtract: subtract
};
