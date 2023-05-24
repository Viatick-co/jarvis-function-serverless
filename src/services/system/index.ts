
import {
  RequestBodyPayload,
  RequestParams
} from "../../types";
import { OciFunctionErrorLog } from "../db/system-models/OciFunctionErrorLog";
import { ApiRequestLog } from "../db/system-models/ApiRequestLog";

const logError = async (
  applicationId : number,
  serviceName : string,
  path : string,
  params : RequestParams,
  body : RequestBodyPayload,
  errorMessage : string,
  errorStack : string
) : Promise<void> => {
  await OciFunctionErrorLog.create({
    applicationId,
    serviceName,
    params,
    path,
    body,
    errorMessage,
    errorStack
  });
};

const logRequest = async (
  applicationId : number,
  endpoint : string,
  apiParams : RequestParams,
  apiBody : string
) : Promise<void> => {
  try {
    if (applicationId <= 0) return;

    let logParams = apiParams ? JSON.stringify(apiParams) : null;
    await ApiRequestLog.create({
      applicationId,
      endpoint,
      params : logParams,
      body : apiBody
    });
  } catch (e) {
    console.error(e);
  }
};

export {
  logError,
  logRequest
};
