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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = exports.logError = void 0;
const OciFunctionErrorLog_1 = require("../db/system-models/OciFunctionErrorLog");
const ApiRequestLog_1 = require("../db/system-models/ApiRequestLog");
const logError = (applicationId, serviceName, path, params, body, errorMessage, errorStack) => __awaiter(void 0, void 0, void 0, function* () {
    yield OciFunctionErrorLog_1.OciFunctionErrorLog.create({
        applicationId,
        serviceName,
        params,
        path,
        body,
        errorMessage,
        errorStack
    });
});
exports.logError = logError;
const logRequest = (applicationId, endpoint, apiParams, apiBody) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (applicationId <= 0)
            return;
        let logParams = apiParams ? JSON.stringify(apiParams) : null;
        yield ApiRequestLog_1.ApiRequestLog.create({
            applicationId,
            endpoint,
            params: logParams,
            body: apiBody
        });
    }
    catch (e) {
        console.error(e);
    }
});
exports.logRequest = logRequest;
