import { RequestBodyPayload, RequestParams } from "../../types";
declare const logError: (applicationId: number, serviceName: string, path: string, params: RequestParams, body: RequestBodyPayload, errorMessage: string, errorStack: string) => Promise<void>;
declare const logRequest: (applicationId: number, endpoint: string, apiParams: RequestParams, apiBody: string) => Promise<void>;
export { logError, logRequest };
