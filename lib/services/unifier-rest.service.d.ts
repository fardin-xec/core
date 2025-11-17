import { WorkflowBPRequest } from '../model/bp-request.model';
export declare class UnifierRESTService {
    private baseURL;
    private userName;
    private password;
    private options;
    constructor(baseURL: string, userName: string, password: string, options: {
        timeout: number;
    });
    private getToken;
    updateBPRecord<T>(bp: WorkflowBPRequest<T>, options?: {
        timeout: number;
    }): Promise<any>;
    getUDRRecords(udrReportName: string, options?: {
        timeout?: number;
    }): Promise<any[]>;
    createBPRecord<T>(projectNumber: string, bpName: string, data: T, options?: {
        timeout?: number;
    }): Promise<any>;
}
