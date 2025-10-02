import { isEmpty } from 'lodash/lang';
import path from 'path';
import { BasicBPRequest, FilterBPRequest, WorkflowBPRequest } from '../model/bp-request.model';
import { ServerDownException } from '../service-down.exception';
import { runAfterResponseHook, runBeforeRequestHook, UnifierResponse } from '../utils/unifier.utils';
import { SOAP, SOAPRequestOptions } from './soap.service';

export class UnifierWebService {
  private __soap: SOAP;
  constructor(
    endpoint: string,
    private username: string,
    private password: string,
    private options: SOAPRequestOptions = {} as any
  ) {
    const pathToWSDL = path.join(__dirname, '../..', 'UnifierWebServices.wsdl');
    this.__soap = new SOAP(pathToWSDL, endpoint, {
      type: 'NONE'
    });
  }
  public async process<T>(
    operation: string,
    data: any,
    options: SOAPRequestOptions = {} as any,
    beforeSend?: (xml: string) => void
  ) {
    try {
      const request = runBeforeRequestHook({ data }, this.username, this.password);
      // console.log(request);
      const _options = Object.assign(this.options, options);
      const response = await this.__soap.process(operation, request, _options, beforeSend);
      const result = runAfterResponseHook<T>({ data: response, operationName: operation });
      return result;
    } catch (e) {
      if (e?.message?.includes('getaddrinfo')) {
        throw new ServerDownException('Unifier web service down');
      }
      throw e;
    }
  }

  public createBPRecord<T>(bp: BasicBPRequest<T>, options: SOAPRequestOptions = {} as any, beforeSend?: (xml) => void) {
    return this.process(
      'createBPRecord',
      {
        projectNumber: bp.projectNumber,
        BPName: bp.bpName,
        BPXML: bp.bpXML
      },
      options,
      beforeSend
    );
  }

  public updateBPRecord<T>(bp: WorkflowBPRequest<T>, soapOptions: SOAPRequestOptions = {} as any, beforeSend?: (xml) => void) {
    bp.workflow = bp.workflow || ({} as any);
    let _options: any = {};
    if (bp.lineItemIdentifier) {
      _options.LineItemIdentifier = bp.lineItemIdentifier;
    }
    if (bp.workflow.currentStepName && bp.workflow.action) {
      _options.WFCurrentStepName = bp.workflow.currentStepName;
      _options.WFActionName = bp.workflow.action;
    }

    if (isEmpty(_options)) {
      _options = null;
    }
    return this.process(
      'updateBPRecordV2',
      {
        projectNumber: bp.projectNumber,
        BPName: bp.bpName,
        BPXML: bp.bpXML,
        options: _options
      },
      soapOptions,
      beforeSend
    );
  }

  public getUDRData(
    reportName: string,
    projectNumber?: string,
    options: SOAPRequestOptions = {} as any,
    beforeSend?: (xml) => void
  ) {
    return this.process(
      'getUDRData',
      {
        projectNumber: projectNumber,
        reportName: reportName
      },
      options,
      beforeSend
    );
  }

  public getBPList<T>(bp: FilterBPRequest, options: SOAPRequestOptions = {} as any, beforeSend?: (xml) => void) {
    return this.process<T>(
      'getBPList',
      {
        projectNumber: bp.projectNumber,
        BPName: bp.bpName,
        filterCondition: bp.filterCondition
      },
      options,
      beforeSend
    );
  }
}
