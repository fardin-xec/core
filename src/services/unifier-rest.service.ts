/// <reference types="node" />
import { WorkflowBPRequest } from '../model/bp-request.model';
import { REST } from './rest.service';
import { AxiosError } from 'axios';
import AdmZip from 'adm-zip';

interface UnifierError {
  message: string;
  data: unknown | null;
}

function isAxiosError(e: unknown): e is AxiosError {
  return (e as AxiosError)?.isAxiosError === true;
}

function toErrorMessage(e: unknown): string {
  if (isAxiosError(e)) {
    return JSON.stringify((e as AxiosError).toJSON());
  }
  if (e instanceof Error) {
    return e.message;
  }
  return JSON.stringify(e);
}

function toUnifierError(e: unknown): UnifierError {
  if (e && typeof e === 'object' && 'message' in e) {
    return {
      message: (e as UnifierError).message,
      data: (e as UnifierError).data ?? null
    };
  }
  return {
    message: String(e),
    data: null
  };
}

export class UnifierRESTService {
  constructor(
    private baseURL: string,
    private userName: string,
    private password: string,
    private options: { timeout: number }
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  private async getToken(): Promise<string> {
    try {
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BASIC', username: this.userName, password: this.password },
        { timeout: 30000, responseType: 'json' }
      );
      const resp = await rest.get('v1/login');
      if (resp.data.status === 200) {
        return resp.data.token as string;
      }
      throw new Error(
        'Unifier REST API Token generation not success. Response: ' + JSON.stringify(resp?.data)
      );
    } catch (e) {
      throw new Error('Unifier REST API Token generation failed. Cause: ' + toErrorMessage(e));
    }
  }

  public async updateBPRecord<T>(
    bp: WorkflowBPRequest<T>,
    options: { timeout: number } = { timeout: null }
  ): Promise<unknown> {
    try {
      bp.workflow = bp.workflow || ({} as any);
      const _options: Record<string, unknown> = { bpname: bp.bpName };

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
        bp.bpXML.List_Wrapper._bp = [bp.bpXML.List_Wrapper._bp] as any;
      }

      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );
      const resp = await rest.put('v1/bp/record/' + bp.projectNumber, {
        options: _options,
        data: bp.bpXML.List_Wrapper._bp
      });
      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier update failed. Cause: ' + String(resp.data?.message),
          data: resp.data
        };
      }
      return resp.data;
    } catch (e) {
      throw toUnifierError(e);
    }
  }

  public async getUDRRecords(
    udrReportName: string,
    options: { timeout?: number } = {}
  ): Promise<unknown[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const resp = await rest.post('v1/data/udr/get', { reportname: udrReportName });

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch UDR records: ' + String(resp.data?.message));
      }

      return (resp.data.data as unknown[]) || [];
    } catch (e) {
      throw new Error('Unifier REST API UDR fetch failed. Cause: ' + toErrorMessage(e));
    }
  }

  public async getUDRRecordsProjects(
    udrReportName: string,
    project_number: string,
    options: { timeout?: number } = {}
  ): Promise<unknown[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );
      console.log('Calling UDR with:', {
        url: 'v1/data/udr/get/' + project_number,
        reportname: udrReportName
      });

      const resp = await rest.post('v1/data/udr/get/' + project_number, {
        reportname: udrReportName
      });

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch UDR records: ' + String(resp.data?.message));
      }

      return (resp.data.data as unknown[]) || [];
    } catch (e) {
      throw new Error('Unifier REST API UDR fetch failed. Cause: ' + toErrorMessage(e));
    }
  }

  public async createBPRecord<T>(
    projectNumber: string,
    bpName: string,
    data: T,
    options: { timeout?: number } = {}
  ): Promise<unknown> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const payload = { options: { bpname: bpName }, data: [data] };
      const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);

      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier create failed. Cause: ' + String(resp.data?.message),
          data: resp.data
        };
      }

      return resp.data;
    } catch (e) {
      throw toUnifierError(e);
    }
  }

  public async createBPCustomeRecord<T>(
    projectNumber: string,
    payload: T,
    options: { timeout?: number } = {}
  ): Promise<unknown> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const resp = await rest.post(`v1/bp/record/${projectNumber}`, payload);

      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier create failed. Cause: ' + String(resp.data?.message),
          data: resp.data
        };
      }

      return resp.data;
    } catch (e) {
      throw toUnifierError(e);
    }
  }

  public async updateBPRecordByJSON<T extends { record_no: string }>(
    projectNumber: string,
    bpName: string,
    data: T,
    options: { timeout?: number } = {}
  ): Promise<unknown> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const payload = { options: { bpname: bpName }, data: [data] };
      const resp = await rest.put(`v1/bp/record/${projectNumber}`, payload);

      if (resp.data.status !== 200) {
        throw {
          message: 'Unifier update failed. Cause: ' + String(resp.data?.message),
          data: resp.data
        };
      }

      return resp.data;
    } catch (e) {
      throw toUnifierError(e);
    }
  }

  public async getBPRecord(
    projectNumber: string,
    bpName: string,
    recordNo: string,
    includeAttachments: boolean = false,
    options: { timeout?: number } = {}
  ): Promise<unknown> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const inputParam = JSON.stringify({ bpname: bpName, record_no: recordNo });
      const resp = await rest.get(
        `v1/bp/record/${projectNumber}?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch BP record: ' + String(resp.data?.message));
      }

      const recordData: Record<string, unknown> =
        resp.data.data?.[0] ?? resp.data.data ?? {};

      if (includeAttachments) {
        try {
          const attachmentsList = await this.getBPAttachmentsList(
            projectNumber, bpName, recordNo, options
          );
          console.log(attachmentsList);

          if (attachmentsList && attachmentsList.length > 0) {
            const attachmentsWithData: unknown[] = [];

            for (const attachment of attachmentsList) {
              try {
                const fileBuffer = await this.getBPAttachment(
                  projectNumber,
                  bpName,
                  recordNo,
                  attachment.file_id as string | number,
                  options
                );

                attachmentsWithData.push({
                  fileName: attachment.file_name,
                  fileBuffer,
                  mimeType: this.getMimeTypeFromFileName(attachment.file_name as string),
                  fileId: attachment.file_id,
                  fileSize: attachment.file_size,
                  revisionNo: attachment.revision_no,
                  publicationNo: attachment.publication_no,
                  title: attachment.title,
                  issueDate: attachment.issue_date,
                  tabName: attachment.tab_name
                });
              } catch (error) {
                console.error(`Failed to fetch attachment ${attachment.file_name}:`, error);
              }
            }

            recordData.attachments = attachmentsWithData;
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
      throw new Error(
        'Unifier REST API BP record fetch failed. Cause: ' + toErrorMessage(e)
      );
    }
  }

  private getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
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
    return mimeTypes[extension ?? ''] ?? 'application/octet-stream';
  }

  public async getBPAttachmentsList(
    projectNumber: string,
    bpName: string,
    recordNo: string,
    options: { timeout?: number } = {}
  ): Promise<Record<string, unknown>[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const inputParam = JSON.stringify({ bpname: bpName, record_no: recordNo });
      const resp = await rest.get(
        `v1/bp/record/file/list/${projectNumber}?input=${encodeURIComponent(inputParam)}`
      );

      if (resp.data.status === 200 && resp.data.data?.length > 0) {
        const recordData = resp.data.data[0] as Record<string, unknown>;
        return (recordData.attachments as Record<string, unknown>[]) || [];
      }

      return [];
    } catch (e) {
      throw new Error(
        'Unifier REST API attachments list fetch failed. Cause: ' + toErrorMessage(e)
      );
    }
  }

  public async getBPAttachment(
    projectNumber: string,
    _bpName: string | null,
    _recordNo: string | null,
    fileId: string | number,
    options: { timeout?: number } = {}
  ): Promise<Uint8Array> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'arraybuffer' }
      );

      const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);
      const buffer = new Uint8Array(resp.data as ArrayBuffer);

      const isZipFile = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;

      if (isZipFile) {
        try {
          const zip = new AdmZip(Buffer.from(buffer));
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
        } catch (zipError) {
          console.error('Error unzipping file:', zipError);
          throw new Error(
            'Failed to unzip file: ' +
              (zipError instanceof Error ? zipError.message : String(zipError))
          );
        }
      }

      return buffer;
    } catch (e) {
      throw new Error(
        'Unifier REST API attachment download failed. Cause: ' + toErrorMessage(e)
      );
    }
  }

  public async getBPAttachmentAllFiles(
    projectNumber: string,
    _bpName: string | null,
    _recordNo: string | null,
    fileId: string | number,
    options: { timeout?: number } = {}
  ): Promise<Array<{ fileName: string; fileBuffer: Uint8Array; isDirectory: boolean }>> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'arraybuffer' }
      );

      const resp = await rest.get(`v1/bp/record/download/file/${fileId}`);
      const buffer = new Uint8Array(resp.data as ArrayBuffer);

      const isZipFile = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;

      if (isZipFile) {
        try {
          const zip = new AdmZip(Buffer.from(buffer));
          const zipEntries = zip.getEntries();

          return zipEntries.map((entry) => ({
            fileName: entry.entryName,
            fileBuffer: entry.isDirectory ? new Uint8Array(0) : entry.getData(),
            isDirectory: entry.isDirectory
          }));
        } catch (zipError) {
          console.error('Error unzipping file:', zipError);
          throw new Error(
            'Failed to unzip file: ' +
              (zipError instanceof Error ? zipError.message : String(zipError))
          );
        }
      }

      return [{ fileName: 'file', fileBuffer: buffer, isDirectory: false }];
    } catch (e) {
      throw new Error(
        'Unifier REST API attachment download failed. Cause: ' + toErrorMessage(e)
      );
    }
  }

  public async getShells(
    shellType: string = 'Projects',
    options: { timeout?: number } = {}
  ): Promise<unknown[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const filterParam = JSON.stringify({ filter: { shell_type: shellType } });
      const resp = await rest.get(
        `v2/admin/shell?options=${encodeURIComponent(filterParam)}`
      );

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch shells: ' + String(resp.data?.message));
      }

      return (resp.data.data as unknown[]) || [];
    } catch (e) {
      throw new Error('Unifier REST API Shell fetch failed. Cause: ' + toErrorMessage(e));
    }
  }

  public async getWBS(
    projectNumber: string,
    options: { timeout?: number } = {}
  ): Promise<unknown[]> {
    try {
      const token = await this.getToken();
      const rest = new REST(
        this.baseURL,
        {},
        { type: 'BEARER', token },
        { timeout: options.timeout || this.options.timeout, responseType: 'json' }
      );

      const resp = await rest.get(
        `v2/wbs?project_number=${encodeURIComponent(projectNumber)}`
      );

      if (resp.data.status !== 200) {
        throw new Error('Failed to fetch WBS records: ' + String(resp.data?.message));
      }

      return (resp.data.data as unknown[]) || [];
    } catch (e) {
      throw new Error('Unifier REST API WBS fetch failed. Cause: ' + toErrorMessage(e));
    }
  }
}
