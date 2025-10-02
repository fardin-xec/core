"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifierWebService = void 0;
const lang_1 = require("lodash/lang");
const path_1 = __importDefault(require("path"));
const service_down_exception_1 = require("../service-down.exception");
const unifier_utils_1 = require("../utils/unifier.utils");
const soap_service_1 = require("./soap.service");
class UnifierWebService {
    constructor(endpoint, username, password, options = {}) {
        this.username = username;
        this.password = password;
        this.options = options;
        const pathToWSDL = path_1.default.join(__dirname, '../..', 'UnifierWebServices.wsdl');
        this.__soap = new soap_service_1.SOAP(pathToWSDL, endpoint, {
            type: 'NONE'
        });
    }
    async process(operation, data, options = {}, beforeSend) {
        var _a;
        try {
            const request = (0, unifier_utils_1.runBeforeRequestHook)({ data }, this.username, this.password);
            // console.log(request);
            const _options = Object.assign(this.options, options);
            const response = await this.__soap.process(operation, request, _options, beforeSend);
            const result = (0, unifier_utils_1.runAfterResponseHook)({ data: response, operationName: operation });
            return result;
        }
        catch (e) {
            if ((_a = e === null || e === void 0 ? void 0 : e.message) === null || _a === void 0 ? void 0 : _a.includes('getaddrinfo')) {
                throw new service_down_exception_1.ServerDownException('Unifier web service down');
            }
            throw e;
        }
    }
    createBPRecord(bp, options = {}, beforeSend) {
        return this.process('createBPRecord', {
            projectNumber: bp.projectNumber,
            BPName: bp.bpName,
            BPXML: bp.bpXML
        }, options, beforeSend);
    }
    updateBPRecord(bp, soapOptions = {}, beforeSend) {
        bp.workflow = bp.workflow || {};
        let _options = {};
        if (bp.lineItemIdentifier) {
            _options.LineItemIdentifier = bp.lineItemIdentifier;
        }
        if (bp.workflow.currentStepName && bp.workflow.action) {
            _options.WFCurrentStepName = bp.workflow.currentStepName;
            _options.WFActionName = bp.workflow.action;
        }
        if ((0, lang_1.isEmpty)(_options)) {
            _options = null;
        }
        return this.process('updateBPRecordV2', {
            projectNumber: bp.projectNumber,
            BPName: bp.bpName,
            BPXML: bp.bpXML,
            options: _options
        }, soapOptions, beforeSend);
    }
    getUDRData(reportName, projectNumber, options = {}, beforeSend) {
        return this.process('getUDRData', {
            projectNumber: projectNumber,
            reportName: reportName
        }, options, beforeSend);
    }
    getBPList(bp, options = {}, beforeSend) {
        return this.process('getBPList', {
            projectNumber: bp.projectNumber,
            BPName: bp.bpName,
            filterCondition: bp.filterCondition
        }, options, beforeSend);
    }
}
exports.UnifierWebService = UnifierWebService;
