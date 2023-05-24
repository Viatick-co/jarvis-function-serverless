import stream from "stream";

type RequestParams = {
  [key : string] : string | string[] | undefined;
};

type RequestHeaders = {
  [key : string] : string | string[] | undefined;
};

type RequestBodyPayload = {
  [key : string] : any;
};

type RequestUser = {
  id : number,
  applicationId : number,
  scopes : string[]
}

type RequestUploadFile = {
  data : Buffer,
  fileName : string,
  contentType : string,
  encoding : string
};


interface JsonResponse {
  [key : string] : any;
}

class StreamResponse {
  contentType : string;
  cacheControl : string;
  readableStream : stream.Readable;

  constructor(contentType : string, cacheControl : string, readableStream : stream.Readable) {
    this.contentType = contentType;
    this.cacheControl = cacheControl;
    this.readableStream = readableStream;
  }
}

interface RouteHandler {
  (
    path : string,
    headers : RequestHeaders,
    params : RequestParams,
    body : RequestBodyPayload,
    userData : RequestUser
  ) : Promise<{ [key : string] : any } | StreamResponse>;
}

enum ApiErrorCode {
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

class ServerlessApiError extends Error {
  statusCode : number;
  code : ApiErrorCode;

  constructor(statusCode : number, code : ApiErrorCode, message : string) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
  }
}

export {
  RequestParams,
  RequestHeaders,
  RequestUser,
  RequestBodyPayload,
  RequestUploadFile,
  JsonResponse,
  StreamResponse,
  RouteHandler,
  ApiErrorCode,
  ServerlessApiError
};
