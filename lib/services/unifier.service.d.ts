import { BasicBPRequest, FilterBPRequest, WorkflowBPRequest } from '../model/bp-request.model';
import { UnifierResponse } from '../utils/unifier.utils';
import { SOAPRequestOptions } from './soap.service';
export declare class UnifierWebService {
    private username;
    private password;
    private options;
    private __soap;
    constructor(endpoint: string, username: string, password: string, options?: SOAPRequestOptions);
    process<T>(operation: string, data: any, options?: SOAPRequestOptions, beforeSend?: (xml: string) => void): Promise<[UnifierResponse<T>, string]>;
    createBPRecord<T>(bp: BasicBPRequest<T>, options?: SOAPRequestOptions, beforeSend?: (xml: any) => void): Promise<[UnifierResponse<unknown>, string]>;
    updateBPRecord<T>(bp: WorkflowBPRequest<T>, soapOptions?: SOAPRequestOptions, beforeSend?: (xml: any) => void): Promise<[UnifierResponse<unknown>, string]>;
    getUDRData(reportName: string, projectNumber?: string, options?: SOAPRequestOptions, beforeSend?: (xml: any) => void): Promise<[UnifierResponse<unknown>, string]>;
    getBPList<T>(bp: FilterBPRequest, options?: SOAPRequestOptions, beforeSend?: (xml: any) => void): Promise<[UnifierResponse<T>, string]>;
}
