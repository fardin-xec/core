"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const SERVER_DATE_FORMAT = 'YYYY-MM-DD 00:00:00';
const SERVER_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
/**
 * Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @param onlyDate whether to omit the time component (default: true)
 * @returns formatted date string
 */
function convertDateToISO(date, onlyDate = true) {
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
function convertISOToDate(dateString) {
    if (!dateString || dateString.trim() === '') {
        return undefined;
    }
    return parseDate(dateString);
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
}
function formatDate(date, dateFormat) {
    return moment_1.default(date).format(dateFormat);
}
function parseDate(dateString, dateFormat) {
    return moment_1.default(dateString, dateFormat).toDate();
}
function add(date, amount, unit) {
    return moment_1.default(date).add(amount, unit).toDate();
}
function subtract(date, amount, unit) {
    return moment_1.default(date).subtract(amount, unit).toDate();
}
exports.DateUtils = {
    format: formatDate,
    parse: parseDate,
    convertDateToISO,
    convertISOToDate,
    isValidDate,
    add,
    subtract
};
