/// <reference types="node" />
/// <reference types="node" />
import stream from "stream";
type RequestParams = {
    [key: string]: string | string[] | undefined;
};
type RequestHeaders = {
    [key: string]: string | string[] | undefined;
};
type RequestBodyPayload = {
    [key: string]: any;
};
type RequestUploadFile = {
    data: Buffer;
    fileName: string;
    contentType: string;
    encoding: string;
};
interface JsonResponse {
    [key: string]: any;
}
declare class StreamResponse {
    contentType: string;
    cacheControl: string;
    readableStream: stream.Readable;
    constructor(contentType: string, cacheControl: string, readableStream: stream.Readable);
}
interface RouteHandler {
    (path: string, headers: RequestHeaders, params: RequestParams, body: RequestBodyPayload): Promise<{
        [key: string]: any;
    } | StreamResponse>;
}
declare enum ApiErrorCode {
    UNKNOWN = "UNKNOWN",
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    DATA_INVALID = "DATA_INVALID",
    ID_EXISTS = "ID_EXISTS",
    AUTHENTICATE_FAILED = "AUTHENTICATE_FAILED",
    DISABLED_ACCESS = "DISABLED_ACCESS",
    NO_ROUTE = "NO_ROUTE",
    ACTION_DENIED = "ACTION_DENIED",
    NOT_FOUND = "NOT_FOUND"
}
declare class ServerlessApiError extends Error {
    statusCode: number;
    code: ApiErrorCode;
    constructor(statusCode: number, code: ApiErrorCode, message: string);
}
export { RequestParams, RequestHeaders, RequestBodyPayload, RequestUploadFile, JsonResponse, StreamResponse, RouteHandler, ApiErrorCode, ServerlessApiError };
