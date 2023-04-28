import { RequestBodyPayload, RequestParams } from "../../types";
declare const logError: (applicationId: number, serviceName: string, path: string, params: RequestParams, body: RequestBodyPayload, errorMessage: string, errorStack: string) => Promise<void>;
export { logError };
