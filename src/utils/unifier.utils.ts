import { XMLUtils } from './xml.utils';

export function convertToXmlObject<T>(input): UnifierResponse<T> {
  let errorStatus = [];
  try {
    // Error message processing
    if (input.errorStatus) {
      if (input.errorStatus instanceof Array) {
        errorStatus = input.errorStatus.filter(status => status && status.length);
      } else if (input.errorStatus.errorStatus) {
        errorStatus.push(input.errorStatus.errorStatus);
      } else {
        errorStatus.push(input.errorStatus);
      }
    }

    // xml conversion
    const xml = input.xmlcontents;
    let xmlcontents = null;
    if (xml) {
      xmlcontents = XMLUtils.convertXMLtoJSON(xml);
      //logger.debug('xmlcontents: ',xmlcontents)
    }
    return {
      xmlcontents,
      statusCode: input.statusCode,
      errorStatus
    };
  } catch (e) {
    return {
      xmlcontents: null,
      statusCode: -1,
      errorStatus: errorStatus || ['Empty response']
    };
  }
}

export interface UnifierResponse<T> {
  xmlcontents: T;
  statusCode: number;
  errorStatus: string[];
}

export function runBeforeRequestHook(context: any, username: string, password: string) {
  const result = context.data;
  if (result.BPXML) {
    result.BPXML = '<![CDATA[' + XMLUtils.convertJSONtoXML(result.BPXML, { coder: 'escapeXML' }) + ']]>';
  }
  // if (result.BPName) {
  //   result.BPName = XMLUtils.escapeXML(result.BPName);
  // }
  if (result.options) {
    result.options = `<![CDATA[<options>${XMLUtils.convertJSONtoXML(result.options, {
      coder: 'escapeXML'
    })}</options>]]>`;
  }
  result.shortname = username;
  result.authcode = password;
  return result;
}

export function runAfterResponseHook<T>(context: any): [UnifierResponse<T>, string] {
  let result: UnifierResponse<T> = {} as any;
  if (context.data.length && context.data[0].return) {
    result = convertToXmlObject(context.data[0].return);
  } else {
    result = convertToXmlObject(null);
  }
  if (context.operationName === 'getUDRData' && result.statusCode === 200 && result.xmlcontents) {
    result.xmlcontents = convertUDRResponse<T>((result.xmlcontents as any).report);
  }
  return [result, context.data[1]];
}

function convertUDRResponse<T>(report: any) {
  let rows: T = [] as any;
  if (report) {
    const headerMap = {};
    if (report.report_header) {
      for (const key in report.report_header) {
        if (report.report_header.hasOwnProperty(key)) {
          let element = report.report_header[key];
          element = element.replace(/ /g, '_');
          element = element.replace(/-/g, '_');
          headerMap[key] = element.replace(/\./g, '');
        }
      }
    }
    if (report.report_row && !(report.report_row instanceof Array)) {
      report.report_row = [report.report_row];
    }
    if (report.report_row && report.report_row.length) {
      rows = report.report_row.map(row => {
        const newRow = {};
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            const element = row[key];
            let headerKey = headerMap[key];
            newRow[headerKey] = element;
          }
        }
        return newRow;
      });
    }
  }
  return rows;
}
