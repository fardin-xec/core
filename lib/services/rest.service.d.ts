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
    request(config: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    get(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    head(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    post(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    put(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
    patch(url: string, data: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any, {}>>;
}
