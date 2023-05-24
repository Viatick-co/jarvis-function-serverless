import { Model } from "sequelize-typescript";
export declare class ApiRequestLog extends Model<ApiRequestLog> {
    id: number;
    applicationId: number;
    endpoint: string;
    params: string;
    body: string;
    method: string;
    request_time: Date;
}
