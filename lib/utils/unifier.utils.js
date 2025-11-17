"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_utils_1 = require("./xml.utils");
function convertToXmlObject(input) {
    let errorStatus = [];
    try {
        // Error message processing
        if (input.errorStatus) {
            if (input.errorStatus instanceof Array) {
                errorStatus = input.errorStatus.filter(status => status && status.length);
            }
            else if (input.errorStatus.errorStatus) {
                errorStatus.push(input.errorStatus.errorStatus);
            }
            else {
                errorStatus.push(input.errorStatus);
            }
        }
        // xml conversion
        const xml = input.xmlcontents;
        let xmlcontents = null;
        if (xml) {
            xmlcontents = xml_utils_1.XMLUtils.convertXMLtoJSON(xml);
            //logger.debug('xmlcontents: ',xmlcontents)
        }
        return {
            xmlcontents,
            statusCode: input.statusCode,
            errorStatus
        };
    }
    catch (e) {
        return {
            xmlcontents: null,
            statusCode: -1,
            errorStatus: errorStatus || ['Empty response']
        };
    }
}
exports.convertToXmlObject = convertToXmlObject;
function runBeforeRequestHook(context, username, password) {
    const result = context.data;
    if (result.BPXML) {
        result.BPXML = '<![CDATA[' + xml_utils_1.XMLUtils.convertJSONtoXML(result.BPXML, { coder: 'escapeXML' }) + ']]>';
    }
    // if (result.BPName) {
    //   result.BPName = XMLUtils.escapeXML(result.BPName);
    // }
    if (result.options) {
        result.options = `<![CDATA[<options>${xml_utils_1.XMLUtils.convertJSONtoXML(result.options, {
            coder: 'escapeXML'
        })}</options>]]>`;
    }
    result.shortname = username;
    result.authcode = password;
    return result;
}
exports.runBeforeRequestHook = runBeforeRequestHook;
function runAfterResponseHook(context) {
    let result = {};
    if (context.data.length && context.data[0].return) {
        result = convertToXmlObject(context.data[0].return);
    }
    else {
        result = convertToXmlObject(null);
    }
    if (context.operationName === 'getUDRData' && result.statusCode === 200 && result.xmlcontents) {
        result.xmlcontents = convertUDRResponse(result.xmlcontents.report);
    }
    return [result, context.data[1]];
}
exports.runAfterResponseHook = runAfterResponseHook;
function convertUDRResponse(report) {
    let rows = [];
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
