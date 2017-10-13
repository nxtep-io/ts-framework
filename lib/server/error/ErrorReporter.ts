import * as Raven from 'raven';
import { LoggerInstance } from 'winston';
import SimpleLogger from '../../logger';
import HttpError from "./http/HttpError";
import { BaseRequest } from "../../base/BaseRequest";
import { BaseResponse } from "../../base/BaseResponse";
import { HttpServerErrors } from "./http/HttpCode";

export interface ErrorReporterOptions {
  raven?: Raven.Client;
  logger?: LoggerInstance;
}

export interface ErrorDefinitions {
  [code: string]: {
    status: number;
    message: number;
  }
}

export class ErrorReporter {
  logger: LoggerInstance;
  options: ErrorReporterOptions;
  errorDefinitions: ErrorDefinitions;

  constructor(errorDefinitions: ErrorDefinitions, options: ErrorReporterOptions = {}) {
    this.errorDefinitions = errorDefinitions;
    this.options = options;
    this.logger = options.logger || SimpleLogger.getInstance();
  }

  static middleware(errorDefinitions: ErrorDefinitions, options: ErrorReporterOptions): (Application) => void {
    const reporter = new ErrorReporter(errorDefinitions, options);
    return function errorReporterMiddleware(app) {
      app.use((req, res) => reporter.notFound(req, res));
      app.use((error, req, res, next) => reporter.unknownError(error, req, res, next));
    };
  };

  notFound(req: BaseRequest, res: BaseResponse) {
    // Build error instance
    const error = new HttpError(`The resource was not found: ${req.method.toUpperCase()} ${req.originalUrl}`, 404, {
      method: req.method,
      originalUrl: req.originalUrl,
    });

    // Send to Sentry if available
    if (this.options.raven) {
      this.options.raven.captureException(error, {
        req: req,
        level: 'warning',
        tags: { stackId: error.stackId }
      } as any);
    }

    // Log to console
    this.logger.warn(error.message, error.details);

    // Respond with error
    res.error(error);
  }

  unknownError(error: any, req: BaseRequest, res: BaseResponse, next: Function) {
    let serverError: HttpError;

    // Prepare error instance
    if (error instanceof HttpError) {
      serverError = error as any;
    } else {
      serverError = new HttpError(error.message, error.status || HttpServerErrors.INTERNAL_SERVER_ERROR);
      serverError.stack = error.stack || serverError.stack;
    }

    // Send to Sentry if available
    if (this.options.raven) {
      this.options.raven.captureException(serverError, {
        req: req,
        level: 'error',
        tags: { stackId: serverError.stackId }
      } as any);
    }

    // Log to console
    this.logger.error(error.message, serverError.details);

    // TODO: Hide stack in production
    console.error(error.stack);

    // Respond with error
    res.error(serverError);
  }
}

export default ErrorReporter.middleware;