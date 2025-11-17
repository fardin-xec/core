"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_xml_parser_1 = require("fast-xml-parser");
const he_1 = __importDefault(require("he"));
const J2X_Options = {
    coder: 'encode'
};
const X2J_Options = {
    ignoreNameSpace: true,
    coder: 'decode'
};
function convertJSONtoXML(obj, opts = {}) {
    let _opts = Object.assign(J2X_Options, opts);
    _opts = applyTagValueProcessor(_opts);
    const _j2xParser = new fast_xml_parser_1.j2xParser(_opts);
    return _j2xParser.parse(obj);
}
exports.convertJSONtoXML = convertJSONtoXML;
function convertXMLtoJSON(xml, opts = {}) {
    let _opts = Object.assign(X2J_Options, opts);
    _opts = applyTagValueProcessor(_opts);
    return fast_xml_parser_1.parse(xml, _opts);
}
exports.convertXMLtoJSON = convertXMLtoJSON;
const ESCAPE_MAP = {
    '>': '&gt;',
    '<': '&lt;',
    "'": '&apos;',
    '"': '&quot;',
    '&': '&amp;'
};
function escapeXML(text, ignore) {
    var pattern;
    if (text === null || text === undefined)
        return;
    ignore = (ignore || '').replace(/[^&"<>\']/g, '');
    pattern = '([&"<>\'])'.replace(new RegExp('[' + ignore + ']', 'g'), '');
    return text.replace(new RegExp(pattern, 'g'), function (str, item) {
        return ESCAPE_MAP[item];
    });
}
//#region Encode and Decode
function applyTagValueProcessor(opts) {
    if (opts.coder === 'encode') {
        opts.tagValueProcessor = encode;
    }
    else if (opts.coder === 'decode') {
        opts.tagValueProcessor = decode;
    }
    else if (opts.coder === 'escapeXML') {
        opts.tagValueProcessor = (v) => {
            if (typeof v === 'string') {
                return escapeXML(v);
            }
            return v;
        };
    }
    if (opts)
        return opts;
}
function encode(v) {
    if (typeof v === 'string') {
        return he_1.default.encode(v, {
            useNamedReferences: true,
            encodeEverything: false
        });
    }
    return v;
}
function decode(v) {
    if (typeof v === 'string') {
        return he_1.default.decode(v, { useNamedReferences: true });
    }
    return v;
}
exports.XMLUtils = {
    convertJSONtoXML: convertJSONtoXML,
    convertXMLtoJSON: convertXMLtoJSON,
    escapeXML: escapeXML
};
