"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REST = void 0;
const axios_1 = __importDefault(require("axios"));
const lang_1 = require("lodash/lang");
class REST {
    constructor(baseURL, headers, auth, options = { timeout: 5000, responseType: 'json' }) {
        let authHeader = {};
        if (auth) {
            authHeader = this.getAuthHeader(auth);
        }
        this.instance = axios_1.default.create({
            baseURL: baseURL,
            headers: Object.assign(Object.assign({}, headers), authHeader),
            timeout: options.timeout,
            responseType: options.responseType,
            maxContentLength: -1
        });
    }
    getAuthHeader(auth) {
        let security;
        switch (auth.type) {
            case 'BASIC':
                security = 'Basic ' + Buffer.from(auth.username + ':' + auth.password).toString('base64');
                break;
            case 'BEARER':
                if ((0, lang_1.isEmpty)(auth.token)) {
                    throw new Error('Authentication token missing');
                }
                security = 'Bearer ' + auth.token;
                break;
            case 'COOKIE':
                break;
            case 'WSS_TOKEN':
                break;
            case 'NONE':
                break;
            default:
                break;
        }
        if (security) {
            return { Authorization: security };
        }
        return {};
    }
    request(config) {
        return this.instance.request(config);
    }
    get(url, config) {
        return this.instance.get(url, config);
    }
    delete(url, config) {
        return this.instance.delete(url, config);
    }
    head(url, config) {
        return this.instance.head(url, config);
    }
    post(url, data, config) {
        return this.instance.post(url, data, config);
    }
    put(url, data, config) {
        return this.instance.put(url, data, config);
    }
    patch(url, data, config) {
        return this.instance.patch(url, data, config);
    }
}
exports.REST = REST;
