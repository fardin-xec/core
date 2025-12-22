import { WorkflowBPRequest } from '../model/bp-request.model';
import { isEmpty, isArray } from 'lodash/lang';
import { REST } from './rest.service';
import { AxiosError } from 'axios';

export class UnifierRESTService {
  constructor(
    private baseURL: string,
    private userName: string,
    private password: string,
    private options: { timeout: number }
  ) {}

  private async getToken() {
    try {
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BASIC', username: this.userName, password: this.password },
        { timeout: 30000, responseType: 'json' }
      );
      const resp = await rest.get('v1/login');
      if (resp.data.status === 200) {
        return resp.data.token;
      }
      throw new Error('Unifier REST API Token generation not success. Response: ' + JSON.stringify(resp?.data));
    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API Token generation failed. Cause: ' + JSON.stringify(message));
    }
  }

  public async updateBPRecord<T>(bp: WorkflowBPRequest<T>, options: { timeout: number } = { timeout: null }) {
    try {
      bp.workflow = bp.workflow || ({} as any);
      let _options: any = { bpname: bp.bpName };
      if (bp.lineItemIdentifier) {
        _options.LineItemIdentifier = bp.lineItemIdentifier;
      }
      if (bp.workflow.currentStepName && bp.workflow.action) {
        _options.workflow_details = {
          WFCurrentStepName: bp.workflow.currentStepName,
          WFActionName: bp.workflow.action
        };
      }

      if (isEmpty(_options)) {
        _options = null;
      }

      if (!isArray(bp.bpXML.List_Wrapper._bp)) {
        bp.bpXML.List_Wrapper._bp = [bp.bpXML.List_Wrapper._bp] as any;
      }

      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        {
          type: 'BEARER',
          token: token
        },
        {
          timeout: options.timeout || this.options.timeout,
          responseType: 'json'
        }
      );
      const resp = await rest.put('v1/bp/record/' + bp.projectNumber, {
        options: _options,
        data: bp.bpXML.List_Wrapper._bp
      });
      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier update failed. Cause: ' + resp.data?.message?.toString(),
          data: resp.data
        };
      }
      return resp.data;
    } catch (e) {
      throw {
        message: e.message,
        data: e.data || null
      };
    }
  }

  public async getUDRRecords(
    udrReportName: string,
    options: { timeout?: number } = {}
  ): Promise<any[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const resp = await rest.post('v1/data/udr/get', {
        reportname: udrReportName
      });

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch UDR records: ' + resp.data?.message?.toString());
      }

      return resp.data.data || [];
    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API UDR fetch failed. Cause: ' + JSON.stringify(message));
    }
  }

  public async createBPRecord<T>(
    projectNumber: string,
    bpName: string,
    data: T,
    options: { timeout?: number } = {}
  ): Promise<any> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const payload = {
        options: { bpname: bpName },
        data: [data]
      };

      const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);

      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier create failed. Cause: ' + resp.data?.message?.toString(),
          data: resp.data
        };
      }

      return resp.data;
    } catch (e) {
      throw {
        message: e.message,
        data: e.data || null
      };
    }
  }

  /**
   * Get BP record by record number with optional attachments
   */
  public async getBPRecord(
    projectNumber: string,
    bpName: string,
    recordNo: string,
    includeAttachments: boolean = false,
    options: { timeout?: number } = {}
  ): Promise<any> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const inputParam = JSON.stringify({
        bpname: bpName,
        record_no: recordNo
      });

      const resp = await rest.get(
        `v1/bp/record/${projectNumber}?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch BP record: ' + resp.data?.message?.toString());
      }

      const recordData = resp.data.data?.[0] || resp.data.data;

      if (includeAttachments) {
        try {
          const attachmentsList = await this.getBPAttachmentsList(
            projectNumber,
            bpName,
            recordNo,
            options
          );

          if (attachmentsList && attachmentsList.length > 0) {
            console.log(`Fetching ${attachmentsList.length} attachment file(s)...`);

            const attachmentsWithData = await Promise.all(
              attachmentsList.map(async (attachment: any) => {
                try {
                  console.log(`Downloading: ${attachment.file_name} (ID: ${attachment.file_id})`);

                  const fileBuffer = await this.getBPAttachment(
                    projectNumber,
                    bpName,
                    recordNo,
                    attachment.file_id,
                    options
                  );

                  // Verify buffer integrity
                  if (!Buffer.isBuffer(fileBuffer)) {
                    console.error(`Invalid buffer returned for ${attachment.file_name}`);
                    return null;
                  }

                  if (fileBuffer.length === 0) {
                    console.error(`Empty buffer returned for ${attachment.file_name}`);
                    return null;
                  }

                  console.log(`✓ Downloaded: ${attachment.file_name} (${fileBuffer.length} bytes)`);

                  return {
                    fileName: attachment.file_name,
                    fileBuffer: fileBuffer,
                    mimeType: this.getMimeTypeFromFileName(attachment.file_name),
                    fileId: attachment.file_id,
                    fileSize: attachment.file_size || fileBuffer.length,
                    revisionNo: attachment.revision_no,
                    publicationNo: attachment.publication_no,
                    title: attachment.title,
                    issueDate: attachment.issue_date,
                    tabName: attachment.tab_name
                  };
                } catch (error) {
                  console.error(`Failed to fetch attachment ${attachment.file_name}:`, error.message);
                  return null;
                }
              })
            );

            recordData.attachments = attachmentsWithData.filter(att => att !== null);
            console.log(`Successfully prepared ${recordData.attachments.length} attachment(s)`);
          } else {
            recordData.attachments = [];
          }
        } catch (error) {
          console.warn('Could not fetch attachments list:', error);
          recordData.attachments = [];
        }
      }

      return recordData;
    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API BP record fetch failed. Cause: ' + JSON.stringify(message));
    }
  }

  /**
   * Helper method to determine MIME type from file name
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
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
      'rar': 'application/x-rar-compressed',
      'dwg': 'application/acad',
      'dxf': 'application/dxf',
      'msg': 'application/vnd.ms-outlook'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Get list of attachments for a BP record
   */
  public async getBPAttachmentsList(
    projectNumber: string,
    bpName: string,
    recordNo: string,
    options: { timeout?: number } = {}
  ): Promise<any[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const inputParam = JSON.stringify({
        bpname: bpName,
        record_no: recordNo
      });

      const resp = await rest.get(
        `v1/bp/record/file/list/${projectNumber}?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status === 200 && resp.data.data && resp.data.data.length > 0) {
        const recordData = resp.data.data[0];
        return recordData.attachments || [];
      }

      return [];
    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API attachments list fetch failed. Cause: ' + JSON.stringify(message));
    }
  }

  /**
   * Get attachment file from BP record
   * CRITICAL: This must return a proper Buffer for binary file data
   */
  public async getBPAttachment(
    projectNumber: string,
    bpName: string | null,
    recordNo: string | null,
    fileId: string | number,
    options: { timeout?: number } = {}
  ): Promise<Buffer> {
    try {
      const token = await this.getToken();

      // CRITICAL: Use 'arraybuffer' response type for binary data
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        {
          timeout: options.timeout || this.options.timeout,
          responseType: 'arraybuffer' // This is crucial for binary data
        }
      );

      const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);

      // Verify response data exists
      if (!resp.data) {
        throw new Error('No data received from server');
      }

      // Convert response to Buffer
      // The response should be an ArrayBuffer when responseType is 'arraybuffer'
      let buffer: Buffer;

      if (Buffer.isBuffer(resp.data)) {
        // Already a Buffer
        buffer = resp.data;
      } else if (resp.data instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Buffer
        buffer = Buffer.from(resp.data);
      } else if (typeof resp.data === 'string') {
        // If somehow we got a string (base64 or otherwise), handle it
        console.warn('Received string data instead of ArrayBuffer - this may indicate an API issue');
        // Try to decode as base64 first
        try {
          buffer = Buffer.from(resp.data, 'base64');
        } catch (e) {
          // If that fails, treat as binary string
          buffer = Buffer.from(resp.data, 'binary');
        }
      } else if (resp.data && typeof resp.data === 'object') {
        // Handle various object formats
        if (resp.data.type === 'Buffer' && Array.isArray(resp.data.data)) {
          // JSON-serialized Buffer
          buffer = Buffer.from(resp.data.data);
        } else if (ArrayBuffer.isView(resp.data)) {
          // TypedArray (Uint8Array, etc.)
          buffer = Buffer.from(resp.data.buffer, resp.data.byteOffset, resp.data.byteLength);
        } else {
          throw new Error('Unexpected data format: ' + JSON.stringify(Object.keys(resp.data)));
        }
      } else {
        throw new Error('Unknown response data type: ' + typeof resp.data);
      }

      // Verify buffer is valid
      if (!Buffer.isBuffer(buffer)) {
        throw new Error('Failed to create Buffer from response');
      }

      if (buffer.length === 0) {
        throw new Error('Received empty buffer from server');
      }

      // Log buffer details for debugging
      console.log(`Buffer created: ${buffer.length} bytes, header: ${buffer.slice(0, 16).toString('hex')}`);

      return buffer;

    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API attachment download failed. Cause: ' + JSON.stringify(message));
    }
  }
}
