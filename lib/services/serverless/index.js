"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBufferPayload = void 0;
const busboy_1 = __importDefault(require("busboy"));
const parseBufferPayload = (contentType, contentLength, body) => new Promise((resolve, reject) => {
    console.log({
        name: "parseBufferPayload",
        contentType: contentType,
        contentLength: contentLength
    });
    const busboy = (0, busboy_1.default)({
        headers: {
            "content-type": contentType,
            "content-length": contentLength
        }
    });
    const bodyData = {};
    busboy.on("file", (fieldname, stream, info) => {
        let fileData = null;
        const { filename, encoding, mimeType } = info;
        console.log(`File [${filename}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);
        stream.on("data", data => {
            fileData = data;
        });
        stream.on("close", () => {
            if (!!fileData) {
                bodyData[fieldname] = {
                    data: fileData,
                    fileName: filename,
                    contentType: mimeType,
                    encoding
                };
            }
        });
    });
    busboy.on("field", (fieldname, value) => {
        bodyData[fieldname] = value;
    });
    busboy.on("error", (error) => {
        reject(error);
    });
    busboy.on("close", () => {
        resolve(bodyData);
    });
    busboy.write(body, "binary");
    busboy.end();
});
exports.parseBufferPayload = parseBufferPayload;
