import {
  RequestBodyPayload,
  RequestParams
} from "../../types";
import { OciFunctionErrorLog } from "../db/system-models/OciFunctionErrorLog";

const logError = async (
  applicationId : number,
  serviceName : string,
  path : string,
  params : RequestParams,
  body : RequestBodyPayload,
  errorMessage : string,
  errorStack : string
) : Promise<void> => {
  console.log("error log called");

  await OciFunctionErrorLog.create({
    applicationId,
    serviceName,
    params,
    path,
    body,
    errorMessage,
    errorStack
  })
};

export {
  logError
};
