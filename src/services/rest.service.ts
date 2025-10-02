import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import { isEmpty } from 'lodash/lang';
export class REST {
  private instance: AxiosInstance;
  constructor(
    baseURL: string,
    headers: any,
    auth?: { type: 'BASIC' | 'BEARER' | 'NONE'; username?: string; password?: string; token?: any },
    options: { timeout: number; responseType: ResponseType } = { timeout: 5000, responseType: 'json' } as any
  ) {
    let authHeader = {};
    if (auth) {
      authHeader = this.getAuthHeader(auth);
    }
    this.instance = axios.create({
      baseURL: baseURL,
      headers: { ...headers, ...authHeader },
      timeout: options.timeout,
      responseType: options.responseType,
      maxContentLength: -1
    });
  }

  private getAuthHeader(auth: { type: string; username?: string; password?: string; token?: any }) {
    let security;
    switch (auth.type) {
      case 'BASIC':
        security = 'Basic ' + Buffer.from(auth.username + ':' + auth.password).toString('base64');
        break;
      case 'BEARER':
        if (isEmpty(auth.token)) {
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

  public request(config: AxiosRequestConfig) {
    return this.instance.request(config);
  }

  public get(url, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }

  public delete(url, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }

  public head(url, config?: AxiosRequestConfig) {
    return this.instance.head(url, config);
  }

  public post(url, data, config?: AxiosRequestConfig) {
    return this.instance.post(url, data, config);
  }

  public put(url, data, config?: AxiosRequestConfig) {
    return this.instance.put(url, data, config);
  }

  public patch(url, data, config?: AxiosRequestConfig) {
    return this.instance.patch(url, data, config);
  }
}
