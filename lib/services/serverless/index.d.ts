/// <reference types="node" />
import { RequestBodyPayload } from "../../types";
export declare const parseBufferPayload: (contentType: string, body: Buffer) => Promise<RequestBodyPayload>;
