/**
 * Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @param onlyDate whether to omit the time component (default: true)
 * @returns formatted date string
 */
declare function convertDateToISO(date: Date, onlyDate?: boolean): string | undefined;
/**
 * Converts ISO date string to JS Date object
 *
 * @param dateString iso date string
 * @returns js Date or undefined if input is empty
 */
declare function convertISOToDate(dateString: string): Date | undefined;
declare function isValidDate(d: Date): boolean;
declare function formatDate(date: Date, dateFormat: string): string;
declare function parseDate(dateString: string, dateFormat?: string): Date;
declare function add(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date;
declare function subtract(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date;
export declare const DateUtils: {
    format: typeof formatDate;
    parse: typeof parseDate;
    convertDateToISO: typeof convertDateToISO;
    convertISOToDate: typeof convertISOToDate;
    isValidDate: typeof isValidDate;
    add: typeof add;
    subtract: typeof subtract;
};
export {};
