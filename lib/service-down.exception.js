"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDownException = void 0;
class ServerDownException extends Error {
    constructor(message = ``, code = 1000) {
        super(message);
        this.code = code;
    }
    what() {
        return this.message;
    }
}
exports.ServerDownException = ServerDownException;
