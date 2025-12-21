"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("lodash/lang");
const rest_service_1 = require("./rest.service");
class UnifierRESTService {
    constructor(baseURL, userName, password, options) {
        this.baseURL = baseURL;
        this.userName = userName;
        this.password = password;
        this.options = options;
    }
    async getToken() {
        try {
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BASIC', username: this.userName, password: this.password }, { timeout: 30000, responseType: 'json' });
            const resp = await rest.get('v1/login');
            if (resp.data.status === 200) {
                return resp.data.token;
            }
            throw new Error('Unifier REST API Token generation not success. Response: ' + JSON.stringify(resp === null || resp === void 0 ? void 0 : resp.data));
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API Token generation failed. Cause: ' + JSON.stringify(message));
        }
    }
    async updateBPRecord(bp, options = { timeout: null }) {
        var _a, _b;
        try {
            bp.workflow = bp.workflow || {};
            let _options = { bpname: bp.bpName };
            if (bp.lineItemIdentifier) {
                _options.LineItemIdentifier = bp.lineItemIdentifier;
            }
            if (bp.workflow.currentStepName && bp.workflow.action) {
                _options.workflow_details = {
                    WFCurrentStepName: bp.workflow.currentStepName,
                    WFActionName: bp.workflow.action
                };
            }
            if (lang_1.isEmpty(_options)) {
                _options = null;
            }
            if (!lang_1.isArray(bp.bpXML.List_Wrapper._bp)) {
                bp.bpXML.List_Wrapper._bp = [bp.bpXML.List_Wrapper._bp];
            }
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, {
                type: 'BEARER',
                token: token
            }, {
                timeout: options.timeout || this.options.timeout,
                responseType: 'json'
            });
            const resp = await rest.put('v1/bp/record/' + bp.projectNumber, {
                options: _options,
                data: bp.bpXML.List_Wrapper._bp
            });
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier update failed. Cause: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw {
                message: e.message,
                data: e.data || null
            };
        }
    }
    async getUDRRecords(udrReportName, options = {}) {
        var _a, _b;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const resp = await rest.post('v1/data/udr/get', {
                reportname: udrReportName
            });
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch UDR records: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()));
            }
            return resp.data.data || [];
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API UDR fetch failed. Cause: ' + JSON.stringify(message));
        }
    }
    async createBPRecord(projectNumber, bpName, data, options = {}) {
        var _a, _b;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const payload = {
                options: { bpname: bpName },
                data: [data]
            };
            const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier create failed. Cause: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw {
                message: e.message,
                data: e.data || null
            };
        }
    }
    /**
     * Get BP record by record number with optional attachments
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number to retrieve
     * @param includeAttachments Whether to include attachments (default: false)
     * @param options Request options
     * @returns BP record with optional attachments
     */
    async getBPRecord(projectNumber, bpName, recordNo, includeAttachments = false, options = {}) {
        var _a, _b, _c;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            // Build input parameter
            const inputParam = JSON.stringify({
                bpname: bpName,
                record_no: recordNo
            });
            // GET request to retrieve BP record
            const resp = await rest.get(`v1/bp/record/${projectNumber}?input=${encodeURIComponent(inputParam)}`);
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch BP record: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()));
            }
            const recordData = ((_c = resp.data.data) === null || _c === void 0 ? void 0 : _c[0]) || resp.data.data;
            // If attachments are requested, fetch them separately
            if (includeAttachments) {
                try {
                    const attachmentsList = await this.getBPAttachmentsList(projectNumber, bpName, recordNo, options);
                    if (attachmentsList && attachmentsList.length > 0) {
                        const attachmentsWithData = await Promise.all(attachmentsList.map(async (attachment) => {
                            try {
                                const fileBuffer = await this.getBPAttachment(projectNumber, bpName, recordNo, attachment.file_id, options);
                                return {
                                    fileName: attachment.file_name,
                                    fileBuffer: fileBuffer,
                                    mimeType: this.getMimeTypeFromFileName(attachment.file_name),
                                    fileId: attachment.file_id,
                                    fileSize: attachment.file_size,
                                    revisionNo: attachment.revision_no,
                                    publicationNo: attachment.publication_no,
                                    title: attachment.title,
                                    issueDate: attachment.issue_date,
                                    tabName: attachment.tab_name
                                };
                            }
                            catch (error) {
                                console.error(`Failed to fetch attachment ${attachment.file_name}:`, error);
                                return null;
                            }
                        }));
                        // Add attachments to record data
                        recordData.attachments = attachmentsWithData.filter(att => att !== null);
                    }
                    else {
                        recordData.attachments = [];
                    }
                }
                catch (error) {
                    console.warn('Could not fetch attachments list:', error);
                    recordData.attachments = [];
                }
            }
            return recordData;
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API BP record fetch failed. Cause: ' + JSON.stringify(message));
        }
    }
    /**
     * Helper method to determine MIME type from file name
     */
    getMimeTypeFromFileName(fileName) {
        var _a;
        const extension = (_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed'
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }
    /**
     * Get list of attachments for a BP record
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number
     * @param options Request options
     * @returns Array of attachment metadata
     */
    async getBPAttachmentsList(projectNumber, bpName, recordNo, options = {}) {
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const inputParam = JSON.stringify({
                bpname: bpName,
                record_no: recordNo
            });
            // Correct endpoint: v1/bp/record/file/list/{projectNumber}
            const resp = await rest.get(`v1/bp/record/file/list/${projectNumber}?input=${encodeURIComponent(inputParam)}`);
            if (resp.data.status === 200 && resp.data.data && resp.data.data.length > 0) {
                // Extract attachments from the response
                const recordData = resp.data.data[0];
                return recordData.attachments || [];
            }
            return [];
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API attachments list fetch failed. Cause: ' + JSON.stringify(message));
        }
    }
    /**
     * Get attachment file from BP record
     * @param projectNumber Project number
     * @param bpName Business Process name (optional, can be null)
     * @param recordNo Record number (optional, can be null)
     * @param fileId File ID to download
     * @param options Request options
     * @returns Buffer containing the file data
     */
    async getBPAttachment(projectNumber, bpName, recordNo, fileId, options = {}) {
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, {
                timeout: options.timeout || this.options.timeout,
                responseType: 'arraybuffer'
            });
            // Correct endpoint: v1/bp/record/download/file/{file_id}
            const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);
            return Buffer.from(resp.data);
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API attachment download failed. Cause: ' + JSON.stringify(message));
        }
    }
}
exports.UnifierRESTService = UnifierRESTService;
