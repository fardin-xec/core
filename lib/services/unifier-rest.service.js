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
            // Using the correct UDR endpoint with POST method and reportname in body
            const resp = await rest.post('v1/data/udr/get', {
                reportname: udrReportName
            });
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch UDR records: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()));
            }
            // Return the data array from response
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
        var _a, _b, _c, _d;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            // Build query parameters
            const queryParams = new URLSearchParams({
                bpname: bpName,
                record_no: recordNo
            });
            if (includeAttachments) {
                queryParams.append('include_attachments', 'true');
            }
            // GET request to retrieve BP record
            const resp = await rest.get(`v1/bp/record/${projectNumber}?${queryParams.toString()}`);
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch BP record: ' + ((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.toString()));
            }
            const recordData = ((_c = resp.data.data) === null || _c === void 0 ? void 0 : _c[0]) || resp.data.data;
            // If attachments are requested and present, fetch attachment files
            if (includeAttachments && ((_d = recordData === null || recordData === void 0 ? void 0 : recordData.attachments) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                const attachmentsWithData = await Promise.all(recordData.attachments.map(async (attachment) => {
                    try {
                        const fileBuffer = await this.getBPAttachment(projectNumber, bpName, recordNo, attachment.id || attachment.fileName, options);
                        return {
                            fileName: attachment.fileName || attachment.name,
                            fileBuffer: fileBuffer,
                            mimeType: attachment.mimeType || attachment.contentType || 'application/octet-stream',
                            id: attachment.id,
                            size: attachment.size
                        };
                    }
                    catch (error) {
                        console.error(`Failed to fetch attachment ${attachment.fileName}:`, error);
                        return null;
                    }
                }));
                // Filter out failed attachments
                recordData.attachments = attachmentsWithData.filter(att => att !== null);
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
     * Get attachment file from BP record
     * @param projectNumber Project number
     * @param bpName Business Process name
     * @param recordNo Record number
     * @param attachmentId Attachment ID or filename
     * @param options Request options
     * @returns Buffer containing the file data
     */
    async getBPAttachment(projectNumber, bpName, recordNo, attachmentId, options = {}) {
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, {
                timeout: options.timeout || this.options.timeout,
                responseType: 'arraybuffer' // Important: get binary data
            });
            const queryParams = new URLSearchParams({
                bpname: bpName,
                record_no: recordNo,
                attachment_id: attachmentId
            });
            const resp = await rest.get(`v1/bp/record/${projectNumber}/attachment?${queryParams.toString()}`);
            // Return the binary data as Buffer
            return Buffer.from(resp.data);
        }
        catch (e) {
            const _e = e;
            const message = _e.isAxiosError ? _e.toJSON() : _e.message;
            throw new Error('Unifier REST API attachment fetch failed. Cause: ' + JSON.stringify(message));
        }
    }
}
exports.UnifierRESTService = UnifierRESTService;
