/**
 *Converts JS Date object to Server specific format (alias ISO)
 *
 * @param date js date object
 * @returns ISO date string
 */
declare function convertDateToISO(date: Date, onlyDate?: boolean): string;
/**
 *Converts ISO date string to JS Date object
 *
 * @param dateString iso date string
 * @returns js Date
 */
declare function convertISOToDate(dateString: string): Date;
declare function isValidDate(d: Date): boolean;
declare function format(date: Date, format: string): string;
declare function parse(dateString: string, format?: string): Date;
declare function add(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date;
declare function subtract(date: Date, amount: number, unit: 'hour' | 'day' | 'month' | 'year'): Date;
export declare const DateUtils: {
    format: typeof format;
    parse: typeof parse;
    convertDateToISO: typeof convertDateToISO;
    convertISOToDate: typeof convertISOToDate;
    isValidDate: typeof isValidDate;
    add: typeof add;
    subtract: typeof subtract;
};
export {};
