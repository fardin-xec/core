import * as soap from 'soap';

export class SOAP {
  private __client: soap.Client;
  constructor(
    private url: string,
    private endPoint: string,
    private auth?: { type: string; username?: string; password?: string; token?: any }
  ) {}
  public async getClient() {
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

  public async process(operation: string, data: any, options: SOAPRequestOptions = {} as any, beforeSend?: (xml) => void) {
    options.timeout = options.timeout || 5000;
    const client = await this.getClient();
    if (!client[operation + 'Async']) {
      throw new Error('Operation not exist in service. Check operation name and service WSDL.');
    }
    return (client[operation + 'Async'] as any)(
      data,
      {
        timeout: options.timeout, // TODO: Get timeout from settings
        postProcess: xml => {
          if (beforeSend && typeof beforeSend === 'function') {
            const body = SOAP.getSoapBodyFromEnvelop(xml);
            beforeSend(body);
          }
          return xml;
        }
      },
      options.headers
    );
  }

  public static getSoapBodyFromEnvelop(xml) {
    try {
      let tagname = '';
      const rx = new RegExp(/(\S+)(="http:\/\/schemas\.xmlsoap\.org\/soap\/envelope)/, 'g');
      const [_, attr] = rx.exec(xml);
      tagname = attr.split(':')[1] + ':Body';
      const start = xml.indexOf(`<${tagname}>`);
      let body: string = xml.substr(start, xml.indexOf(`</${tagname}>`) - start) + `</${tagname}>`;
      body = body.replace(/&lt;/g, '<');
      body = body.replace(/&gt;/g, '>');
      body = body.replace(/&amp;/g, '&');
      body = body.replace(/&quot;/g, `"`);
      body = body.replace(/&apos;/g, `'`);
      return body;
    } catch (e) {
      console.error('Failed to extract body from envelop', e);
      return xml;
    }
  }
}

export interface SOAPRequestOptions {
  timeout?: number;
  headers?: any;
}
