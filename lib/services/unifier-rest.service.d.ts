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
    createBPCustomeRecord<T>(projectNumber: string, payload: T, options?: {
        timeout?: number;
    }): Promise<any>;
    /**
   * Update a BP record using a JSON body
   * @param projectNumber Project number
   * @param bpName Business Process name
   * @param data Record data to update (must include record_no field)
   * @param options Request options
   * @returns Updated BP record response
   */
    updateBPRecordByJSON<T extends {
        record_no: string;
    }>(projectNumber: string, bpName: string, data: T, options?: {
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
     * Helper method to determine MIME type from file name
     */
    private getMimeTypeFromFileName;
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
     * Get attachment file from BP record and automatically unzip if it's a zip file
     * @param projectNumber Project number
     * @param bpName Business Process name (optional, can be null)
     * @param recordNo Record number (optional, can be null)
     * @param fileId File ID to download
     * @param options Request options
     * @returns Buffer containing the unzipped file data (first file in zip) or original file if not zipped
     */
    getBPAttachment(projectNumber: string, bpName: string | null, recordNo: string | null, fileId: string | number, options?: {
        timeout?: number;
    }): Promise<Buffer>;
    /**
     * Get all files from a zipped attachment
     * @param projectNumber Project number
     * @param bpName Business Process name (optional, can be null)
     * @param recordNo Record number (optional, can be null)
     * @param fileId File ID to download
     * @param options Request options
     * @returns Array of objects containing file names and buffers
     */
    getBPAttachmentAllFiles(projectNumber: string, bpName: string | null, recordNo: string | null, fileId: string | number, options?: {
        timeout?: number;
    }): Promise<Array<{
        fileName: string;
        fileBuffer: Buffer;
        isDirectory: boolean;
    }>>;
}
