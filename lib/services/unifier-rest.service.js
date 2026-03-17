"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_service_1 = require("./rest.service");
const adm_zip_1 = __importDefault(require("adm-zip"));
function isAxiosError(e) {
    var _a;
    return ((_a = e) === null || _a === void 0 ? void 0 : _a.isAxiosError) === true;
}
function toErrorMessage(e) {
    if (isAxiosError(e)) {
        return JSON.stringify(e.toJSON());
    }
    if (e instanceof Error) {
        return e.message;
    }
    return JSON.stringify(e);
}
function toUnifierError(e) {
    var _a;
    if (e && typeof e === 'object' && 'message' in e) {
        return {
            message: e.message,
            data: (_a = e.data) !== null && _a !== void 0 ? _a : null
        };
    }
    return {
        message: String(e),
        data: null
    };
}
class UnifierRESTService {
    constructor(baseURL, userName, password, options) {
        this.baseURL = baseURL;
        this.userName = userName;
        this.password = password;
        this.options = options;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
            throw new Error('Unifier REST API Token generation failed. Cause: ' + toErrorMessage(e));
        }
    }
    async updateBPRecord(bp, options = { timeout: null }) {
        var _a;
        try {
            bp.workflow = bp.workflow || {};
            const _options = { bpname: bp.bpName };
            if (bp.lineItemIdentifier) {
                _options.LineItemIdentifier = bp.lineItemIdentifier;
            }
            if (bp.workflow.currentStepName && bp.workflow.action) {
                _options.workflow_details = {
                    WFCurrentStepName: bp.workflow.currentStepName,
                    WFActionName: bp.workflow.action
                };
            }
            if (!Array.isArray(bp.bpXML.List_Wrapper._bp)) {
                bp.bpXML.List_Wrapper._bp = [bp.bpXML.List_Wrapper._bp];
            }
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const resp = await rest.put('v1/bp/record/' + bp.projectNumber, {
                options: _options,
                data: bp.bpXML.List_Wrapper._bp
            });
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier update failed. Cause: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw toUnifierError(e);
        }
    }
    async getUDRRecords(udrReportName, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const resp = await rest.post('v1/data/udr/get', { reportname: udrReportName });
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch UDR records: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message));
            }
            return resp.data.data || [];
        }
        catch (e) {
            throw new Error('Unifier REST API UDR fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
    async getUDRRecordsProjects(udrReportName, project_number, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            console.log('Calling UDR with:', {
                url: 'v1/data/udr/get/' + project_number,
                reportname: udrReportName
            });
            const resp = await rest.post('v1/data/udr/get/' + project_number, {
                reportname: udrReportName
            });
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch UDR records: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message));
            }
            return resp.data.data || [];
        }
        catch (e) {
            throw new Error('Unifier REST API UDR fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
    async createBPRecord(projectNumber, bpName, data, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const payload = { options: { bpname: bpName }, data: [data] };
            const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier create failed. Cause: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw toUnifierError(e);
        }
    }
    async createBPCustomeRecord(projectNumber, payload, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier create failed. Cause: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw toUnifierError(e);
        }
    }
    async updateBPRecordByJSON(projectNumber, bpName, data, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const payload = { options: { bpname: bpName }, data: [data] };
            const resp = await rest.put(`v1/bp/record/${projectNumber}`, payload);
            if (resp.data.status !== 200) {
                throw {
                    message: 'Unifier update failed. Cause: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message),
                    data: resp.data
                };
            }
            return resp.data;
        }
        catch (e) {
            throw toUnifierError(e);
        }
    }
    async getBPRecord(projectNumber, bpName, recordNo, includeAttachments = false, options = {}) {
        var _a, _b, _c, _d;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const inputParam = JSON.stringify({ bpname: bpName, record_no: recordNo });
            const resp = await rest.get(`v1/bp/record/${projectNumber}?input=${encodeURIComponent(inputParam)}`);
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch BP record: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message));
            }
            const recordData = (_d = (_c = (_b = resp.data.data) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : resp.data.data) !== null && _d !== void 0 ? _d : {};
            if (includeAttachments) {
                try {
                    const attachmentsList = await this.getBPAttachmentsList(projectNumber, bpName, recordNo, options);
                    console.log(attachmentsList);
                    if (attachmentsList && attachmentsList.length > 0) {
                        const attachmentsWithData = [];
                        for (const attachment of attachmentsList) {
                            try {
                                const fileBuffer = await this.getBPAttachment(projectNumber, bpName, recordNo, attachment.file_id, options);
                                attachmentsWithData.push({
                                    fileName: attachment.file_name,
                                    fileBuffer,
                                    mimeType: this.getMimeTypeFromFileName(attachment.file_name),
                                    fileId: attachment.file_id,
                                    fileSize: attachment.file_size,
                                    revisionNo: attachment.revision_no,
                                    publicationNo: attachment.publication_no,
                                    title: attachment.title,
                                    issueDate: attachment.issue_date,
                                    tabName: attachment.tab_name
                                });
                            }
                            catch (error) {
                                console.error(`Failed to fetch attachment ${attachment.file_name}:`, error);
                            }
                        }
                        recordData.attachments = attachmentsWithData;
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
            throw new Error('Unifier REST API BP record fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
    getMimeTypeFromFileName(fileName) {
        var _a, _b;
        const extension = (_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const mimeTypes = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            txt: 'text/plain',
            csv: 'text/csv',
            zip: 'application/zip',
            rar: 'application/x-rar-compressed'
        };
        return (_b = mimeTypes[extension !== null && extension !== void 0 ? extension : '']) !== null && _b !== void 0 ? _b : 'application/octet-stream';
    }
    async getBPAttachmentsList(projectNumber, bpName, recordNo, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const inputParam = JSON.stringify({ bpname: bpName, record_no: recordNo });
            const resp = await rest.get(`v1/bp/record/file/list/${projectNumber}?input=${encodeURIComponent(inputParam)}`);
            if (resp.data.status === 200 && ((_a = resp.data.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const recordData = resp.data.data[0];
                return recordData.attachments || [];
            }
            return [];
        }
        catch (e) {
            throw new Error('Unifier REST API attachments list fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
    async getBPAttachment(projectNumber, _bpName, _recordNo, fileId, options = {}) {
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'arraybuffer' });
            const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);
            const buffer = new Uint8Array(resp.data);
            const isZipFile = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
            if (isZipFile) {
                try {
                    const zip = new adm_zip_1.default(Buffer.from(buffer));
                    const zipEntries = zip.getEntries();
                    if (zipEntries.length === 0) {
                        throw new Error('ZIP file is empty');
                    }
                    const firstEntry = zipEntries[0];
                    if (firstEntry.isDirectory) {
                        const firstFile = zipEntries.find((entry) => !entry.isDirectory);
                        if (!firstFile) {
                            throw new Error('No files found in ZIP archive');
                        }
                        return firstFile.getData();
                    }
                    return firstEntry.getData();
                }
                catch (zipError) {
                    console.error('Error unzipping file:', zipError);
                    throw new Error('Failed to unzip file: ' +
                        (zipError instanceof Error ? zipError.message : String(zipError)));
                }
            }
            return buffer;
        }
        catch (e) {
            throw new Error('Unifier REST API attachment download failed. Cause: ' + toErrorMessage(e));
        }
    }
    async getBPAttachmentAllFiles(projectNumber, _bpName, _recordNo, fileId, options = {}) {
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'arraybuffer' });
            const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);
            const buffer = new Uint8Array(resp.data);
            const isZipFile = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
            if (isZipFile) {
                try {
                    const zip = new adm_zip_1.default(Buffer.from(buffer));
                    const zipEntries = zip.getEntries();
                    return zipEntries.map((entry) => ({
                        fileName: entry.entryName,
                        fileBuffer: entry.isDirectory ? new Uint8Array(0) : entry.getData(),
                        isDirectory: entry.isDirectory
                    }));
                }
                catch (zipError) {
                    console.error('Error unzipping file:', zipError);
                    throw new Error('Failed to unzip file: ' +
                        (zipError instanceof Error ? zipError.message : String(zipError)));
                }
            }
            return [{ fileName: 'file', fileBuffer: buffer, isDirectory: false }];
        }
        catch (e) {
            throw new Error('Unifier REST API attachment download failed. Cause: ' + toErrorMessage(e));
        }
    }
    async getShells(shellType = 'Projects', options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const filterParam = JSON.stringify({ filter: { shell_type: shellType } });
            const resp = await rest.get(`v2/admin/shell?options=${encodeURIComponent(filterParam)}`);
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch shells: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message));
            }
            return resp.data.data || [];
        }
        catch (e) {
            throw new Error('Unifier REST API Shell fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
    async getWBS(projectNumber, options = {}) {
        var _a;
        try {
            const token = await this.getToken();
            const rest = new rest_service_1.REST(this.baseURL, {}, { type: 'BEARER', token }, { timeout: options.timeout || this.options.timeout, responseType: 'json' });
            const resp = await rest.get(`v2/wbs?project_number=${encodeURIComponent(projectNumber)}`);
            if (resp.data.status !== 200) {
                throw new Error('Failed to fetch WBS records: ' + String((_a = resp.data) === null || _a === void 0 ? void 0 : _a.message));
            }
            return resp.data.data || [];
        }
        catch (e) {
            throw new Error('Unifier REST API WBS fetch failed. Cause: ' + toErrorMessage(e));
        }
    }
}
exports.UnifierRESTService = UnifierRESTService;
