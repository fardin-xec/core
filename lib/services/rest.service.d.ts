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
    get(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    delete(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    head(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    post(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    put(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
    patch(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any>>;
}
