export declare class ServerDownException extends Error {
    code: number;
    constructor(message?: string, code?: number);
    what(): string;
}
