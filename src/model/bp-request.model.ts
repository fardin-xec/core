export interface BPRequest {
  projectNumber?: string;
  bpName: string;
}

export interface BPXML<T> {
  List_Wrapper: {
    _bp: T;
  };
}

export interface FilterBPRequest extends BPRequest {
  filterCondition: string;
}

export interface BasicBPRequest<T> extends BPRequest {
  bpXML: BPXML<T>;
}

export interface WorkflowBPRequest<T> extends BasicBPRequest<T> {
  lineItemIdentifier?: string;
  workflow?: {
    currentStepName: string;
    action: string;
  };
}
