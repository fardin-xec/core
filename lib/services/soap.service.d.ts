import * as soap from 'soap';
export declare class SOAP {
    private url;
    private endPoint;
    private auth?;
    private __client;
    constructor(url: string, endPoint: string, auth?: {
        type: string;
        username?: string;
        password?: string;
        token?: any;
    });
    getClient(): Promise<soap.Client>;
    process(operation: string, data: any, options?: SOAPRequestOptions, beforeSend?: (xml: any) => void): Promise<any>;
    static getSoapBodyFromEnvelop(xml: any): any;
}
export interface SOAPRequestOptions {
    timeout?: number;
    headers?: any;
}
