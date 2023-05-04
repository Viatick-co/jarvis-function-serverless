import { RequestBodyPayload } from "../../types";
import Buffer from "buffer";
export declare const parseBufferPayload: (contentType: string, contentLength: string, body: Buffer) => Promise<RequestBodyPayload>;
