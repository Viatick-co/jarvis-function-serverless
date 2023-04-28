import busboy, { FileInfo } from "busboy";
import { RequestBodyPayload } from "../../types";
import { Readable } from "stream";

export const parseBufferPayload = (
  contentType : string,
  body : Buffer
) : Promise<RequestBodyPayload> => new Promise((
  resolve : (value : RequestBodyPayload) => void,
  reject : (reason? : unknown) => void
) => {
  const bb = busboy({ headers : { "content-type" : contentType } });
  const bodyData : RequestBodyPayload = {
    files : []
  };

  bb.on("file", (name: string, stream: Readable, info: FileInfo) => {
    const { filename, encoding, mimeType } = info;

    let fileData : Buffer = null;

    stream.on("data", data => {
      fileData = data as Buffer;
    });

    stream.on("close", () => {
      if (!!fileData) {
        bodyData.files[filename] = {
          data : fileData,
          fileName : filename,
          contentType : mimeType,
          encoding
        };
      }
    });
  });

  bb.on("field", (name: string, value: string) => {
    bodyData[name] = value;
  });

  bb.on("error", (error : Error) => {
    reject(error);
  });

  bb.on('close', () => {
    resolve(bodyData);
  });

  const encoding = "binary";

  bb.write(body, encoding);
  bb.end();
});
