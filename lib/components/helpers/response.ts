import * as util from "util";
import { Request, Response } from "express";
import { BaseError, LoggerInstance } from "ts-framework-common";
import { default as HttpError } from "../../error/http/HttpError";
import { HttpServerErrors, HttpSuccess } from "../../error/http/HttpCode";
import fclone from "fclone";

export interface BaseRequest extends Request {
  user?: any;
  logger: LoggerInstance;
  param(name: string, defaultValue?: any);
}

export interface BaseResponse extends Response {
  error(status: number, error: Error): void;

  error(status: number, error: BaseError): void;

  error(status: number, errorMessage: string): void;

  error(error: HttpError): void;

  success(data?: any): void;
}

export default {
  error(res: Response) {
    return (error: String | Error | HttpError) => {
      if (error instanceof HttpError) {
        res.status(error.status as number).json(error.toJSON());
      } else if (typeof error === "string") {
        res.status(HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: error,
          stack: new Error().stack,
          details: {}
        });
      } else {
        res.status((error as any).status || HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: (error as any).message,
          stack: (error as any).stack,
          details: error
        });
      }
    };
  },

  success(res: Response) {
    return (data: any = {}) => {
      let d = data;

      // If is array, iterate over the elements
      if (data && util.isArray(data)) {
        // Try to call toJSON of each element, if available
        // This will ease the work with Mongoose models as responses
        d = data.map(d => (d && util.isFunction(d.toJSON) ? d.toJSON() : d));
      } else if (data && util.isFunction(data.toJSON)) {
        // Try to call toJSON of the response, if available
        // This will ease the work with Mongoose models as responses
        d = data.toJSON();
      }

      // Drop circular references
      const safeData = fclone(d);

      res
        .status(HttpSuccess.OK)
        .set("Content-Type", "application/json")
        .send(safeData);
    };
  }
};
