/// <reference types="node" />
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
    /**
     * Get BP record by record number with optional attachments
     */
    getBPRecord(projectNumber: string, bpName: string, recordNo: string, includeAttachments?: boolean, options?: {
        timeout?: number;
    }): Promise<any>;
    /**
     * Helper method to determine MIME type from file name
     */
    private getMimeTypeFromFileName;
    /**
     * Get list of attachments for a BP record
     */
    getBPAttachmentsList(projectNumber: string, bpName: string, recordNo: string, options?: {
        timeout?: number;
    }): Promise<any[]>;
    /**
     * Get attachment file from BP record
     * CRITICAL: This must return a proper Buffer for binary file data
     */
    getBPAttachment(projectNumber: string, bpName: string | null, recordNo: string | null, fileId: string | number, options?: {
        timeout?: number;
    }): Promise<Buffer>;
}
