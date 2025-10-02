export declare function convertToXmlObject<T>(input: any): UnifierResponse<T>;
export interface UnifierResponse<T> {
    xmlcontents: T;
    statusCode: number;
    errorStatus: string[];
}
export declare function runBeforeRequestHook(context: any, username: string, password: string): any;
export declare function runAfterResponseHook<T>(context: any): [UnifierResponse<T>, string];
