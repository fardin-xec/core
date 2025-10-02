import { j2xParser, parse as _x2jParser, X2jOptionsOptional, J2xOptions } from 'fast-xml-parser';
import he from 'he';

const J2X_Options: Partial<J2XOptions> = {
  coder: 'encode'
};

const X2J_Options: Partial<X2JOptions> = {
  ignoreNameSpace: true,
  coder: 'decode'
};

export function convertJSONtoXML(obj: any, opts: Partial<J2XOptions> = {}) {
  let _opts = Object.assign(J2X_Options, opts);
  _opts = applyTagValueProcessor(_opts);

  const _j2xParser = new j2xParser(_opts);
  return _j2xParser.parse(obj);
}

export function convertXMLtoJSON(xml: string, opts: Partial<X2JOptions> = {}) {
  let _opts = Object.assign(X2J_Options, opts);
  _opts = applyTagValueProcessor(_opts);
  return _x2jParser(xml, _opts);
}

const ESCAPE_MAP = {
  '>': '&gt;',
  '<': '&lt;',
  "'": '&apos;',
  '"': '&quot;',
  '&': '&amp;'
};

function escapeXML(text: string, ignore?: string) {
  var pattern;

  if (text === null || text === undefined) return;

  ignore = (ignore || '').replace(/[^&"<>\']/g, '');
  pattern = '([&"<>\'])'.replace(new RegExp('[' + ignore + ']', 'g'), '');

  return text.replace(new RegExp(pattern, 'g'), function (str, item) {
    return ESCAPE_MAP[item];
  });
}

//#region Encode and Decode

function applyTagValueProcessor(opts: Partial<{ coder: J2XOptions['coder']; tagValueProcessor: any }>) {
  if (opts.coder === 'encode') {
    opts.tagValueProcessor = encode;
  } else if (opts.coder === 'decode') {
    opts.tagValueProcessor = decode;
  } else if (opts.coder === 'escapeXML') {
    opts.tagValueProcessor = (v: string) => {
      if (typeof v === 'string') {
        return escapeXML(v);
      }
      return v;
    };
  }

  if (opts) return opts;
}

function encode(v: string) {
  if (typeof v === 'string') {
    return he.encode(v, {
      useNamedReferences: true,
      encodeEverything: false
    });
  }
  return v;
}

function decode(v: string) {
  if (typeof v === 'string') {
    return he.decode(v, { useNamedReferences: true });
  }
  return v;
}

//#endregion
export interface J2XOptions extends J2xOptions {
  coder: 'encode' | 'decode' | 'escapeXML' | false;
}

export interface X2JOptions extends X2jOptionsOptional {
  coder: 'encode' | 'decode' | 'escapeXML' | false;
}

export const XMLUtils = {
  convertJSONtoXML: convertJSONtoXML,
  convertXMLtoJSON: convertXMLtoJSON,
  escapeXML: escapeXML
};
