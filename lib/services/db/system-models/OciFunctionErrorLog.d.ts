import { Model } from "sequelize-typescript";
import { RequestBodyPayload, RequestParams } from "../../../types";
export declare class OciFunctionErrorLog extends Model<OciFunctionErrorLog> {
    id: number;
    applicationId: number;
    serviceName: string;
    path: string;
    params: RequestParams;
    body: RequestBodyPayload;
    errorMessage: string;
    errorStack: string;
    recordDatetime: Date;
}
