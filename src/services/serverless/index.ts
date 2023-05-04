import Busboy from "busboy";

import {
  RequestBodyPayload,
  RequestUploadFile
} from "../../types";
import { Readable } from "stream";
import Buffer from "buffer";

export const parseBufferPayload = (
  contentType : string,
  contentLength : string,
  body : Buffer
) : Promise<RequestBodyPayload> => new Promise((
  resolve : (value : RequestBodyPayload) => void,
  reject : (reason? : unknown) => void
) => {
  console.log({
    name : "parseBufferPayload",
    contentType : contentType,
    contentLength : contentLength
  });

  const busboy = Busboy({
    headers : {
      "content-type" : contentType,
      "content-length" : contentLength
    }
  });

  const bodyData : RequestBodyPayload = {};

  busboy.on("file", (fieldname : string, stream : Readable, info : Busboy.FileInfo) => {
    let fileData : Buffer = null;

    const {
      filename,
      encoding,
      mimeType
    } = info;
    console.log(
      `File [${ filename }]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );

    stream.on("data", data => {
      fileData = data as Buffer;
    });

    stream.on("close", () => {
      if (!!fileData) {
        bodyData[fieldname] = {
          data : fileData,
          fileName : filename,
          contentType : mimeType,
          encoding
        };
      }
    });

  });

  busboy.on("field", (fieldname : string, value : string) => {
    bodyData[fieldname] = value;
  });

  busboy.on("error", (error : Error) => {
    reject(error);
  });

  busboy.on("close", () => {
    resolve(bodyData);
  });

  busboy.write(body, "binary");
  busboy.end();
});
