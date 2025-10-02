import { X2jOptionsOptional, J2xOptions } from 'fast-xml-parser';
export declare function convertJSONtoXML(obj: any, opts?: Partial<J2XOptions>): any;
export declare function convertXMLtoJSON(xml: string, opts?: Partial<X2JOptions>): any;
declare function escapeXML(text: string, ignore?: string): string;
export interface J2XOptions extends J2xOptions {
    coder: 'encode' | 'decode' | 'escapeXML' | false;
}
export interface X2JOptions extends X2jOptionsOptional {
    coder: 'encode' | 'decode' | 'escapeXML' | false;
}
export declare const XMLUtils: {
    convertJSONtoXML: typeof convertJSONtoXML;
    convertXMLtoJSON: typeof convertXMLtoJSON;
    escapeXML: typeof escapeXML;
};
export {};
