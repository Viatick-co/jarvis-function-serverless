"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBufferPayload = void 0;
const busboy_1 = __importDefault(require("busboy"));
const parseBufferPayload = (contentType, body) => new Promise((resolve, reject) => {
    const bb = (0, busboy_1.default)({ headers: { "content-type": contentType } });
    const bodyData = {
        files: []
    };
    bb.on("file", (name, stream, info) => {
        const { filename, encoding, mimeType } = info;
        let fileData = null;
        stream.on("data", data => {
            fileData = data;
        });
        stream.on("close", () => {
            if (!!fileData) {
                bodyData.files[filename] = {
                    data: fileData,
                    fileName: filename,
                    contentType: mimeType,
                    encoding
                };
            }
        });
    });
    bb.on("field", (name, value) => {
        bodyData[name] = value;
    });
    bb.on("error", (error) => {
        reject(error);
    });
    bb.on('close', () => {
        resolve(bodyData);
    });
    const encoding = "binary";
    bb.write(body, encoding);
    bb.end();
});
exports.parseBufferPayload = parseBufferPayload;
