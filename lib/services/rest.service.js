"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const lang_1 = require("lodash/lang");
class REST {
    constructor(baseURL, headers, auth, options = { timeout: 5000, responseType: 'json' }) {
        let authHeader = {};
        if (auth) {
            authHeader = this.getAuthHeader(auth);
        }
        // Configuration object - use 'any' to bypass TypeScript for decompress option
        const config = {
            baseURL: baseURL,
            headers: Object.assign(Object.assign(Object.assign({}, headers), authHeader), { 
                // Explicitly tell server not to compress if possible
                'Accept-Encoding': 'identity' }),
            timeout: options.timeout,
            responseType: options.responseType,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            // CRITICAL: Prevent automatic decompression for binary files
            // Note: This is a valid axios option but not in TypeScript types
            decompress: false,
            // Don't transform arraybuffer responses
            transformResponse: options.responseType === 'arraybuffer'
                ? [(data) => data]
                : undefined,
        };
        this.instance = axios_1.default.create(config);
        // Add response interceptor for debugging binary downloads
        this.instance.interceptors.response.use((response) => {
            // Log details for binary responses
            if (options.responseType === 'arraybuffer' && response.data) {
                const dataSize = response.data.byteLength || response.data.length || 0;
                const contentLength = response.headers['content-length'];
                const contentEncoding = response.headers['content-encoding'];
                console.log('[REST] Binary response received:');
                console.log(`  Data size: ${dataSize} bytes`);
                console.log(`  Content-Length header: ${contentLength}`);
                console.log(`  Content-Encoding: ${contentEncoding || 'none'}`);
                console.log(`  Content-Type: ${response.headers['content-type']}`);
                // Warn if size mismatch
                if (contentLength && parseInt(contentLength) !== dataSize) {
                    console.warn(`  ⚠️  SIZE MISMATCH: Expected ${contentLength}, got ${dataSize}`);
                }
                // Warn if content is encoded (should not be with decompress: false)
                if (contentEncoding && contentEncoding !== 'identity') {
                    console.warn(`  ⚠️  Content is encoded as: ${contentEncoding}`);
                    // If still gzipped despite our settings, we need manual decompression
                    if (contentEncoding === 'gzip') {
                        console.warn('  ⚠️  Server is still sending gzipped content. Manual decompression may be needed.');
                    }
                }
            }
            return response;
        }, (error) => {
            console.error('[REST] Request failed:', error.message);
            if (error.response) {
                console.error('  Status:', error.response.status);
                console.error('  Headers:', error.response.headers);
            }
            throw error;
        });
    }
    getAuthHeader(auth) {
        let security;
        switch (auth.type) {
            case 'BASIC':
                security = 'Basic ' + Buffer.from(auth.username + ':' + auth.password).toString('base64');
                break;
            case 'BEARER':
                if (lang_1.isEmpty(auth.token)) {
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
