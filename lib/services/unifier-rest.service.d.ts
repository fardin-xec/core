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
    updateBPRecord<T>(bp: WorkflowBPRequest<T>, options: {
        timeout: number;
    }): Promise<unknown>;
    getUDRRecords(udrReportName: string, options?: {
        timeout?: number;
    }): Promise<unknown[]>;
    getUDRRecordsProjects(udrReportName: string, project_number: string, options?: {
        timeout?: number;
    }): Promise<unknown[]>;
    createBPRecord<T>(projectNumber: string, bpName: string, data: T, options?: {
        timeout?: number;
    }): Promise<unknown>;
    createBPCustomeRecord<T>(projectNumber: string, payload: T, options?: {
        timeout?: number;
    }): Promise<unknown>;
    updateBPRecordByJSON<T extends {
        record_no: string;
    }>(projectNumber: string, bpName: string, data: T, options?: {
        timeout?: number;
    }): Promise<unknown>;
    getBPRecord(projectNumber: string, bpName: string, recordNo: string, includeAttachments?: boolean, options?: {
        timeout?: number;
    }): Promise<unknown>;
    private getMimeTypeFromFileName;
    getBPAttachmentsList(projectNumber: string, bpName: string, recordNo: string, options?: {
        timeout?: number;
    }): Promise<Record<string, unknown>[]>;
    getBPAttachment(projectNumber: string, _bpName: string | null, _recordNo: string | null, fileId: string | number, options?: {
        timeout?: number;
    }): Promise<Uint8Array>;
    getBPAttachmentAllFiles(projectNumber: string, _bpName: string | null, _recordNo: string | null, fileId: string | number, options?: {
        timeout?: number;
    }): Promise<Array<{
        fileName: string;
        fileBuffer: Uint8Array;
        isDirectory: boolean;
    }>>;
    getShells(shellType?: string, options?: {
        timeout?: number;
    }): Promise<unknown[]>;
    getWBS(projectNumber: string, options?: {
        timeout?: number;
    }): Promise<unknown[]>;
}
