/// <reference types="node" />
import { Sequelize } from "sequelize-typescript";
import { RequestBodyPayload, RouteHandler } from "./types";
export declare const serverlessSvcManager: {
    sequelize: Sequelize;
    systemSequelize: Sequelize;
};
export declare const testSystemFunc: () => Promise<{
    noRecords: number;
}>;
export declare const initManager: (dbHost: string, dbPort: number, dbName: string, dbUsn: string, dbPassword: string, modelsPath: string, sqlLog: boolean) => Promise<void>;
export declare class JarvisServerless {
    routeMap: Record<string, {
        handler: RouteHandler;
        scopes: string[];
    }>;
    version: string;
    serviceName: string;
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUsn: string;
    dbPwd: string;
    apiPrefix: string;
    modelsPath: string;
    sqlLog: boolean;
    fdk: any;
    constructor(apiPrefix: string, version: string, serviceName: string, dbHost: string, dbPort: number, dbName: string, dbUsn: string, dbPwd: string, modelsPath: string, sqlLog: boolean);
    start: (fdk: any) => void;
    healthCheck: RouteHandler;
    route: (path: string, func: RouteHandler, scopes?: string[]) => void;
    handleRequest: (input: RequestBodyPayload | Buffer, ctx: any) => Promise<unknown>;
}
