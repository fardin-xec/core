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
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number to retrieve
     * @param includeAttachments Whether to include attachments (default: false)
     * @param options Request options
     * @returns BP record with optional attachments
     */
    getBPRecord(projectNumber: string, bpName: string, recordNo: string, includeAttachments?: boolean, options?: {
        timeout?: number;
    }): Promise<any>;
    /**
     * Get list of attachments for a BP record
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number
     * @param options Request options
     * @returns Array of attachment metadata
     */
    getBPAttachmentsList(projectNumber: string, bpName: string, recordNo: string, options?: {
        timeout?: number;
    }): Promise<any[]>;
    /**
     * Get attachment file from BP record
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number
     * @param attachmentId Attachment ID or filename
     * @param options Request options
     * @returns Buffer containing the file data
     */
    getBPAttachment(projectNumber: string, bpName: string, recordNo: string, attachmentId: string, options?: {
        timeout?: number;
    }): Promise<Buffer>;
}
