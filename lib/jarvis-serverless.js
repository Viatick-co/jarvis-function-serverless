"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JarvisServerless = exports.initManager = exports.testSystemFunc = exports.serverlessSvcManager = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const url_1 = __importDefault(require("url"));
const db_1 = require("./services/db");
const system_1 = require("./services/system");
const types_1 = require("./types");
const serverless_1 = require("./services/serverless");
exports.serverlessSvcManager = {
    sequelize: null,
    systemSequelize: null
};
exports.testSystemFunc = db_1.testSystemDb;
const initManager = (dbHost, dbPort, dbName, dbUsn, dbPassword, modelsPath, sqlLog) => __awaiter(void 0, void 0, void 0, function* () {
    if (!exports.serverlessSvcManager.sequelize) {
        exports.serverlessSvcManager.sequelize = yield (0, db_1.loadSequelize)(dbHost, dbPort, dbName, dbUsn, dbPassword, modelsPath, sqlLog);
        exports.serverlessSvcManager.systemSequelize = yield (0, db_1.loadSystemSequelize)(dbHost, dbPort, dbUsn, dbPassword);
    }
    else {
        exports.serverlessSvcManager.sequelize.connectionManager.initPools();
        exports.serverlessSvcManager.systemSequelize.connectionManager.initPools();
        // restore `getConnection()` if it has been overwritten by `close()`
        if (exports.serverlessSvcManager.sequelize.connectionManager.hasOwnProperty("getConnection")) {
            delete exports.serverlessSvcManager.sequelize.connectionManager.getConnection;
        }
        if (exports.serverlessSvcManager.systemSequelize.connectionManager.hasOwnProperty("getConnection")) {
            delete exports.serverlessSvcManager.systemSequelize.connectionManager.getConnection;
        }
    }
});
exports.initManager = initManager;
const endSession = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (exports.serverlessSvcManager === null || exports.serverlessSvcManager === void 0 ? void 0 : exports.serverlessSvcManager.sequelize.connectionManager.close());
    yield (exports.serverlessSvcManager === null || exports.serverlessSvcManager === void 0 ? void 0 : exports.serverlessSvcManager.systemSequelize.connectionManager.close());
});
class JarvisServerless {
    constructor(apiPrefix, version, serviceName, dbHost, dbPort, dbName, dbUsn, dbPwd, modelsPath, sqlLog, requestLog) {
        this.routeMap = {};
        this.version = "";
        this.serviceName = "";
        this.dbHost = "";
        this.dbPort = 3306;
        this.dbName = "";
        this.dbUsn = "";
        this.dbPwd = "";
        this.apiPrefix = "";
        this.modelsPath = "";
        this.sqlLog = false;
        this.requestLog = false;
        this.start = (fdk) => {
            this.fdk = fdk;
            this.fdk.handle(this.handleRequest, { inputMode: "buffer" });
            this.route("/health", this.healthCheck, ["superAdmin"]);
        };
        this.healthCheck = (path, headers, params, body, requestUser) => __awaiter(this, void 0, void 0, function* () {
            return {
                path,
                headers,
                params,
                body,
                db: {
                    name: this.serviceName,
                    version: this.version,
                    host: this.dbHost,
                    port: this.dbPort,
                    dbName: this.dbName,
                    usn: this.dbUsn,
                    apiPrefix: this.apiPrefix
                },
                requestUser,
                time: (0, moment_timezone_1.default)().toISOString()
            };
        });
        this.route = (path, func, scopes = []) => {
            this.routeMap[this.apiPrefix + path] = {
                handler: func,
                scopes
            };
        };
        this.handleRequest = (input, ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const hctx = ctx.httpGateway;
            const requestURL = hctx.requestURL;
            const headers = hctx.headers;
            let path = "";
            let params = {};
            let requestPayload = null;
            let statusCode = 400;
            let errorMessage = "";
            let rpCode = types_1.ApiErrorCode.UNKNOWN;
            let error = null;
            let appId = 0;
            let accountScopes = [];
            let accountId = 0;
            try {
                const xAccountId = headers["X-Account-Id"];
                accountId = !!xAccountId ? parseInt(xAccountId[0]) : 0;
                const xApplicationId = headers["X-Application-Id"];
                appId = !!xApplicationId ? parseInt(xApplicationId[0]) : 0;
                const xAccountScope = headers["X-Account-Scope"];
                if (!!xAccountScope && xAccountScope.length > 0) {
                    accountScopes = xAccountScope[0].split(",");
                }
            }
            catch (e) {
                console.error(e);
            }
            let rqUser = null;
            if (accountId > 0) {
                rqUser = {
                    id: accountId,
                    scopes: accountScopes,
                    applicationId: appId
                };
            }
            try {
                yield (0, exports.initManager)(this.dbHost, this.dbPort, this.dbName, this.dbUsn, this.dbPwd, this.modelsPath, this.sqlLog);
                // for deployment
                const parsedUrl = url_1.default.parse(requestURL, true);
                params = parsedUrl.query;
                path = parsedUrl.pathname;
                const contentType = headers["Content-Type"][0];
                // for local test
                // const path = this.apiPrefix + "/token-verify";
                // const params = {};
                const foundRoute = (_a = this.routeMap) === null || _a === void 0 ? void 0 : _a[path];
                if (!!foundRoute) {
                    try {
                        const { handler, scopes } = foundRoute;
                        // checking scope
                        let validScope = true;
                        if (!!scopes && scopes.length > 0) {
                            validScope = false;
                            if (!!accountScopes && accountScopes.length > 0) {
                                for (const scope of scopes) {
                                    if (accountScopes.indexOf(scope) >= 0) {
                                        validScope = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (validScope) {
                            // if valid scope then continue
                            let logBody = null;
                            if (contentType.startsWith("multipart/form-data")) {
                                const contentLength = headers["Content-Length"][0];
                                requestPayload = yield (0, serverless_1.parseBufferPayload)(contentType, contentLength, input);
                            }
                            else {
                                const inputStr = input === null || input === void 0 ? void 0 : input.toString();
                                logBody = inputStr;
                                requestPayload = !!inputStr ? JSON.parse(inputStr) : {};
                            }
                            (0, system_1.logRequest)(appId, path, params, logBody);
                            const rp = yield handler(path, headers, params, requestPayload, rqUser);
                            statusCode = 200;
                            if (rp instanceof types_1.StreamResponse) {
                                const { readableStream, contentType, cacheControl } = rp;
                                ctx.responseContentType = contentType;
                                const hctx = ctx.httpGateway;
                                hctx.setResponseHeader("Cache-Control", cacheControl);
                                return this.fdk.streamResult(readableStream);
                            }
                            else {
                                return rp;
                            }
                        }
                        else {
                            statusCode = 403;
                            rpCode = types_1.ApiErrorCode.DISABLED_ACCESS;
                            errorMessage = "Scope is invalid!";
                        }
                    }
                    catch (e) {
                        if (e instanceof types_1.ServerlessApiError) {
                            const { statusCode: errorStatusCode, message, code } = e;
                            statusCode = errorStatusCode;
                            rpCode = code;
                            errorMessage = message;
                        }
                        else {
                            statusCode = 500;
                            rpCode = types_1.ApiErrorCode.UNKNOWN;
                            errorMessage = "Handler Error!";
                            error = {
                                message: e.message,
                                stack: e.stack
                            };
                        }
                    }
                }
                else {
                    statusCode = 404;
                    rpCode = types_1.ApiErrorCode.NO_ROUTE;
                    errorMessage = "No route found!";
                }
            }
            catch (e) {
                statusCode = 500;
                errorMessage = "Serverless Error!";
                error = {
                    message: e.message,
                    stack: e.stack
                };
            }
            finally {
                try {
                    // console.error("error status code", {
                    //   statusCode
                    // });
                    if (statusCode === 500) {
                        yield (0, system_1.logError)(appId, this.serviceName, path, params, requestPayload, error === null || error === void 0 ? void 0 : error.message, error === null || error === void 0 ? void 0 : error.stack);
                    }
                }
                finally {
                    yield endSession();
                }
            }
            hctx.statusCode = statusCode;
            return {
                active: false,
                rpCode,
                extraMsg: errorMessage
            };
        });
        this.apiPrefix = apiPrefix;
        this.version = version;
        this.serviceName = serviceName;
        this.dbHost = dbHost;
        this.dbPort = dbPort;
        this.dbName = dbName;
        this.dbUsn = dbUsn;
        this.dbPwd = dbPwd;
        this.modelsPath = modelsPath;
        this.sqlLog = sqlLog;
        this.requestLog = requestLog;
    }
}
exports.JarvisServerless = JarvisServerless;
