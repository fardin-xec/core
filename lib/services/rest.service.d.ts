import { AxiosRequestConfig, ResponseType } from 'axios';
export declare class REST {
    private instance;
    constructor(baseURL: string, headers: any, auth?: {
        type: 'BASIC' | 'BEARER' | 'NONE';
        username?: string;
        password?: string;
        token?: any;
    }, options?: {
        timeout: number;
        responseType: ResponseType;
    });
    private getAuthHeader;
    request(config: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    get(url: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    delete(url: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    head(url: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    post(url: any, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    put(url: any, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    patch(url: any, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
}
