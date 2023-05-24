import moment from "moment-timezone";
import url from "url";
import { Sequelize } from "sequelize-typescript";

import {
  loadSequelize,
  loadSystemSequelize,
  testSystemDb
} from "./services/db";
import {
  logError,
  logRequest
} from "./services/system";

import {
  ApiErrorCode,
  JsonResponse,
  RequestBodyPayload,
  RequestHeaders,
  RequestParams,
  RouteHandler,
  ServerlessApiError,
  StreamResponse
} from "./types";
import { parseBufferPayload } from "./services/serverless";

export const serverlessSvcManager : {
  sequelize : Sequelize,
  systemSequelize : Sequelize
} = {
  sequelize : null,
  systemSequelize : null
};

export const testSystemFunc = testSystemDb;

export const initManager = async (
  dbHost : string,
  dbPort : number,
  dbName : string,
  dbUsn : string,
  dbPassword : string,
  modelsPath : string,
  sqlLog : boolean
) : Promise<void> => {
  if (!serverlessSvcManager.sequelize) {
    serverlessSvcManager.sequelize = await loadSequelize(
      dbHost,
      dbPort,
      dbName,
      dbUsn,
      dbPassword,
      modelsPath,
      sqlLog
    );
    serverlessSvcManager.systemSequelize = await loadSystemSequelize(
      dbHost,
      dbPort,
      dbUsn,
      dbPassword
    );
  } else {
    serverlessSvcManager.sequelize.connectionManager.initPools();
    serverlessSvcManager.systemSequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (serverlessSvcManager.sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete serverlessSvcManager.sequelize.connectionManager.getConnection;
    }

    if (serverlessSvcManager.systemSequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete serverlessSvcManager.systemSequelize.connectionManager.getConnection;
    }
  }
};

const endSession = async () : Promise<void> => {
  await serverlessSvcManager?.sequelize.connectionManager.close();
  await serverlessSvcManager?.systemSequelize.connectionManager.close();
};

export class JarvisServerless {
  routeMap : Record<string, {
    handler : RouteHandler,
    scopes : string[]
  }> = {};
  version = "";
  serviceName = "";
  dbHost = "";
  dbPort = 3306;
  dbName = "";
  dbUsn = "";
  dbPwd = "";
  apiPrefix = "";
  modelsPath = "";
  sqlLog = false;
  requestLog = false;
  fdk : any;

  constructor(
    apiPrefix : string,
    version : string,
    serviceName : string,
    dbHost : string,
    dbPort : number,
    dbName : string,
    dbUsn : string,
    dbPwd : string,
    modelsPath : string,
    sqlLog : boolean,
    requestLog : boolean
  ) {
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

  start = (fdk) => {
    this.fdk = fdk;
    this.fdk.handle(
      this.handleRequest,
      { inputMode : "buffer" }
    );
    this.route("/health", this.healthCheck);
  };

  healthCheck : RouteHandler = async (
    path : string,
    headers : RequestHeaders,
    params : RequestParams,
    body : RequestBodyPayload
  ) : Promise<JsonResponse> => {

    return {
      path,
      headers,
      params,
      body,
      db : {
        name : this.serviceName,
        version : this.version,
        host : this.dbHost,
        port : this.dbPort,
        dbName : this.dbName,
        usn : this.dbUsn,
        apiPrefix : this.apiPrefix
      },
      time : moment().toISOString()
    };
  };

  route = (
    path : string,
    func : RouteHandler,
    scopes : string[] = []
  ) : void => {
    this.routeMap[this.apiPrefix + path] = {
      handler : func,
      scopes
    };
  };

  handleRequest = async (input : Buffer, ctx) : Promise<unknown> => {
    const hctx = ctx.httpGateway;
    const requestURL = hctx.requestURL;
    const headers : RequestHeaders = hctx.headers;
    let path = "";
    let params : RequestParams = {};
    let requestPayload : RequestBodyPayload = null;

    let statusCode = 400;
    let errorMessage = "";
    let rpCode : ApiErrorCode = ApiErrorCode.UNKNOWN;
    let error : {
      message : string,
      stack : string
    } = null;

    let appId = 0;
    let accountScopes : string[] = [];
    try {
      const xApplicationId = headers["X-Application-Id"] as string;
      appId = !!xApplicationId ? parseInt(xApplicationId) : 0;

      const xAccountScope = headers["X-Account-Scope"] as string;
      if (!!xAccountScope) {
        accountScopes = xAccountScope.split(",");
      }
    } catch (e) {
      console.error(e);
    }

    try {
      await initManager(this.dbHost, this.dbPort, this.dbName, this.dbUsn, this.dbPwd, this.modelsPath, this.sqlLog);

      // for deployment
      const parsedUrl = url.parse(requestURL, true);
      params = parsedUrl.query;
      path = parsedUrl.pathname;
      const contentType = headers["Content-Type"][0] as string;

      // for local test
      // const path = this.apiPrefix + "/token-verify";
      // const params = {};

      const foundRoute = this.routeMap?.[path];
      if (!!foundRoute) {
        try {
          const {
            handler,
            scopes
          } = foundRoute;

          let logBody : string = null;
          if (contentType.startsWith("multipart/form-data")) {
            const contentLength = headers["Content-Length"][0];

            requestPayload = await parseBufferPayload(contentType, contentLength, input );
          } else {
            const inputStr = input?.toString();
            logBody = inputStr;
            requestPayload = !!inputStr ? JSON.parse(inputStr) : {};
          }

          logRequest(appId, path, params, logBody);

          const rp = await handler(path, headers, params, requestPayload);
          statusCode = 200;
          if (rp instanceof StreamResponse) {
            const {
              readableStream,
              contentType,
              cacheControl
            } = rp;

            ctx.responseContentType = contentType;

            const hctx = ctx.httpGateway;
            hctx.setResponseHeader("Cache-Control", cacheControl);

            return this.fdk.streamResult(readableStream);
          } else {
            return rp;
          }
        } catch (e) {
          if (e instanceof ServerlessApiError) {
            const {
              statusCode : errorStatusCode,
              message,
              code
            } = e;

            statusCode = errorStatusCode;
            rpCode = code;
            errorMessage = message;
          } else {
            statusCode = 500;
            rpCode = ApiErrorCode.UNKNOWN;
            errorMessage = "Handler Error!";

            error = {
              message : e.message,
              stack : e.stack
            };
          }
        }
      } else {
        statusCode = 404;
        rpCode = ApiErrorCode.NO_ROUTE;
        errorMessage = "No route found!";
      }
    } catch (e) {
      statusCode = 500;
      errorMessage = "Serverless Error!";

      error = {
        message : e.message,
        stack : e.stack
      };
    } finally {
      try {
        // console.error("error status code", {
        //   statusCode
        // });

        if (statusCode === 500) {
          await logError(
            appId,
            this.serviceName,
            path,
            params,
            requestPayload,
            error?.message,
            error?.stack
          );
        }
      } finally {
        await endSession();
      }
    }

    hctx.statusCode = statusCode;

    return {
      active : false,
      rpCode,
      extraMsg : errorMessage
    };
  };
}
