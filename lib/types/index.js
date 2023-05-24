"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerlessApiError = exports.ApiErrorCode = exports.StreamResponse = void 0;
class StreamResponse {
    constructor(contentType, cacheControl, readableStream) {
        this.contentType = contentType;
        this.cacheControl = cacheControl;
        this.readableStream = readableStream;
    }
}
exports.StreamResponse = StreamResponse;
var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["UNKNOWN"] = "UNKNOWN";
    ApiErrorCode["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["DATA_INVALID"] = "DATA_INVALID";
    ApiErrorCode["ID_EXISTS"] = "ID_EXISTS";
    ApiErrorCode["AUTHENTICATE_FAILED"] = "AUTHENTICATE_FAILED";
    ApiErrorCode["DISABLED_ACCESS"] = "DISABLED_ACCESS";
    ApiErrorCode["NO_ROUTE"] = "NO_ROUTE";
    ApiErrorCode["ACTION_DENIED"] = "ACTION_DENIED";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
})(ApiErrorCode || (ApiErrorCode = {}));
exports.ApiErrorCode = ApiErrorCode;
class ServerlessApiError extends Error {
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.ServerlessApiError = ServerlessApiError;
