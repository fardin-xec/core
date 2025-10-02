"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOAP = void 0;
const soap = __importStar(require("soap"));
class SOAP {
    constructor(url, endPoint, auth) {
        this.url = url;
        this.endPoint = endPoint;
        this.auth = auth;
    }
    async getClient() {
        if (!this.__client) {
            this.__client = await soap.createClientAsync(this.url);
            if (this.endPoint && this.endPoint.length) {
                this.__client.setEndpoint(this.endPoint);
            }
            if (this.auth) {
                let security;
                switch (this.auth.type) {
                    case 'BASIC':
                        security = new soap.BasicAuthSecurity(this.auth.username, this.auth.password);
                        break;
                    case 'BEARER':
                        security = new soap.BearerSecurity(this.auth.token);
                        break;
                    case 'COOKIE':
                        // TODO: Cookie based SOAP authentication pending
                        break;
                    case 'WSS_TOKEN':
                        security = new soap.WSSecurity(this.auth.username, this.auth.password, {});
                        break;
                    case 'NONE':
                        break;
                    default:
                        break;
                }
                this.__client.setSecurity(security);
            }
        }
        return this.__client;
    }
    async process(operation, data, options = {}, beforeSend) {
        options.timeout = options.timeout || 5000;
        const client = await this.getClient();
        if (!client[operation + 'Async']) {
            throw new Error('Operation not exist in service. Check operation name and service WSDL.');
        }
        return client[operation + 'Async'](data, {
            timeout: options.timeout, // TODO: Get timeout from settings
            postProcess: xml => {
                if (beforeSend && typeof beforeSend === 'function') {
                    const body = SOAP.getSoapBodyFromEnvelop(xml);
                    beforeSend(body);
                }
                return xml;
            }
        }, options.headers);
    }
    static getSoapBodyFromEnvelop(xml) {
        try {
            let tagname = '';
            const rx = new RegExp(/(\S+)(="http:\/\/schemas\.xmlsoap\.org\/soap\/envelope)/, 'g');
            const [_, attr] = rx.exec(xml);
            tagname = attr.split(':')[1] + ':Body';
            const start = xml.indexOf(`<${tagname}>`);
            let body = xml.substr(start, xml.indexOf(`</${tagname}>`) - start) + `</${tagname}>`;
            body = body.replace(/&lt;/g, '<');
            body = body.replace(/&gt;/g, '>');
            body = body.replace(/&amp;/g, '&');
            body = body.replace(/&quot;/g, `"`);
            body = body.replace(/&apos;/g, `'`);
            return body;
        }
        catch (e) {
            console.error('Failed to extract body from envelop', e);
            return xml;
        }
    }
}
exports.SOAP = SOAP;
