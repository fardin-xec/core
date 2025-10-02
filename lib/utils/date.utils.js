"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const lang_1 = require("lodash/lang");
const moment_1 = __importDefault(require("moment"));
const SERVER_DATE_FORMAT = 'YYYY-MM-DD 00:00:00';
const SERVER_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
/**
 *Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @returns ISO date string
 */
function convertDateToISO(date, onlyDate = true) {
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
function convertISOToDate(dateString) {
    let date;
    if (!(0, lang_1.isEmpty)(dateString)) {
        date = parse(dateString); // moment(dateString).toDate() as Date;
    }
    return date;
}
function isValidDate(d) {
    return d && d instanceof Date && !isNaN(d.getTime());
}
function format(date, format) {
    return (0, moment_1.default)(date).format(format);
}
function parse(dateString, format) {
    return (0, moment_1.default)(dateString, format).toDate();
}
function add(date, amount, unit) {
    return (0, moment_1.default)(date).add(amount, unit).toDate();
}
function subtract(date, amount, unit) {
    return (0, moment_1.default)(date).subtract(amount, unit).toDate();
}
exports.DateUtils = {
    format: format,
    parse: parse,
    convertDateToISO: convertDateToISO,
    convertISOToDate: convertISOToDate,
    isValidDate: isValidDate,
    add: add,
    subtract: subtract
};
