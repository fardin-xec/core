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
   * @param projectNumber Project number
   * @param bpName Business Process name
   * @param recordNo Record number to retrieve
   * @param includeAttachments Whether to include attachments (default: false)
   * @param options Request options
   * @returns BP record with optional attachments
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

      // Build input parameter with optional include_attachments flag
      const inputObj: any = {
        bpname: bpName,
        record_no: recordNo
      };

      // Try adding include_attachments parameter
      if (includeAttachments) {
        inputObj.include_attachments = true;
      }

      const inputParam = JSON.stringify(inputObj);

      // GET request to retrieve BP record
      const resp = await rest.get(
        `v1/bp/record/${projectNumber}?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch BP record: ' + resp.data?.message?.toString());
      }

      const recordData = resp.data.data?.[0] || resp.data.data;

      // If attachments are requested but not in response, try to fetch them separately
      if (includeAttachments) {
        try {
          const attachmentsList = await this.getBPAttachmentsList(
            projectNumber,
            bpName,
            recordNo,
            options
          );

          if (attachmentsList && attachmentsList.length > 0) {
            const attachmentsWithData = await Promise.all(
              attachmentsList.map(async (attachment: any) => {
                try {
                  const fileBuffer = await this.getBPAttachment(
                    projectNumber,
                    bpName,
                    recordNo,
                    attachment.id || attachment.attachment_id || attachment.fileName,
                    options
                  );

                  return {
                    fileName: attachment.fileName || attachment.file_name || attachment.name,
                    fileBuffer: fileBuffer,
                    mimeType: attachment.mimeType || attachment.mime_type || attachment.contentType || 'application/octet-stream',
                    id: attachment.id || attachment.attachment_id,
                    size: attachment.size || attachment.file_size
                  };
                } catch (error) {
                  console.error(`Failed to fetch attachment ${attachment.fileName || attachment.file_name}:`, error);
                  return null;
                }
              })
            );

            // Add attachments to record data
            recordData.attachments = attachmentsWithData.filter(att => att !== null);
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
   * Get list of attachments for a BP record
   * @param projectNumber Project number
   * @param bpName Business Process name
   * @param recordNo Record number
   * @param options Request options
   * @returns Array of attachment metadata
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

      // Try to get attachments list
      const resp = await rest.get(
        `v1/bp/record/${projectNumber}/attachments?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status === 200) {
        return resp.data.data || [];
      }

      return [];
    } catch (e) {
      // If endpoint doesn't exist, return empty array
      console.warn('Attachments list endpoint may not be available');
      return [];
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
  public async getBPAttachment(
    projectNumber: string,
    bpName: string,
    recordNo: string,
    attachmentId: string,
    options: { timeout?: number } = {}
  ): Promise<Buffer> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        {
          timeout: options.timeout || this.options.timeout,
          responseType: 'arraybuffer'
        }
      );

      const inputParam = JSON.stringify({
        bpname: bpName,
        record_no: recordNo,
        attachment_id: attachmentId
      });

      const resp = await rest.get(
        `v1/bp/record/${projectNumber}/attachment?input=${encodeURIComponent(inputParam)}`
      );

      return Buffer.from(resp.data);
    } catch (e) {
      const _e: AxiosError = e;
      const message = _e.isAxiosError ? _e.toJSON() : _e.message;
      throw new Error('Unifier REST API attachment fetch failed. Cause: ' + JSON.stringify(message));
    }
  }
}
