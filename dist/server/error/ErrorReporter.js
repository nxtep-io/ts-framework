"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_framework_common_1 = require("ts-framework-common");
const HttpCode_1 = require("./http/HttpCode");
const HttpError_1 = require("./http/HttpError");
class ErrorReporter {
    constructor(errorDefinitions, options = {}) {
        this.errorDefinitions = errorDefinitions;
        this.options = options;
        this.logger = options.logger || ts_framework_common_1.Logger.getInstance();
    }
    static middleware(errorDefinitions, options) {
        const reporter = new ErrorReporter(errorDefinitions, options);
        return function errorReporterMiddleware(app) {
            app.use((req, res) => reporter.notFound(req, res));
            app.use((error, req, res, next) => reporter.unknownError(error, req, res, next));
        };
    }
    notFound(req, res) {
        // Build error instance
        const error = new HttpError_1.default(`The resource was not found: ${req.method.toUpperCase()} ${req.originalUrl}`, 404, {
            method: req.method,
            originalUrl: req.originalUrl,
        });
        // Send to Sentry if available
        if (this.options.raven) {
            this.options.raven.captureException(error, {
                req,
                level: 'warning',
                tags: { stackId: error.stackId },
            });
        }
        // Log to console
        this.logger.warn(error.message, error.details);
        // Respond with error
        res.error(error);
    }
    unknownError(error, req, res, next) {
        let serverError;
        // Prepare error instance
        if (error && error.inner && error.inner instanceof HttpError_1.default) {
            // Fix for OAuth 2.0 errors, which encapsulate the original one into the "inner" property
            serverError = error.inner;
        }
        else if (error && error instanceof HttpError_1.default) {
            serverError = error;
        }
        else {
            serverError = new HttpError_1.default(error.message, error.status || HttpCode_1.HttpServerErrors.INTERNAL_SERVER_ERROR, {
                code: error.code ? error.code : undefined,
            });
            serverError.stack = error.stack || serverError.stack;
        }
        // Send to Sentry if available
        if (this.options.raven) {
            this.options.raven.captureException(serverError, {
                req,
                level: serverError.status >= 500 ? 'error' : 'warning',
                tags: { stackId: serverError.stackId },
            });
        }
        // Log to console
        this.logger.error(error.message, serverError.details);
        // TODO: Hide stack in production
        console.error(error.stack);
        // Respond with error
        res.error ? res.error(serverError) : res.status(serverError.status || 500).json(serverError.toJSON());
    }
}
exports.ErrorReporter = ErrorReporter;
exports.default = ErrorReporter.middleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JSZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zZXJ2ZXIvZXJyb3IvRXJyb3JSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDZEQUE2QztBQUM3Qyw4Q0FBbUQ7QUFDbkQsZ0RBQXlDO0FBY3pDO0lBS0UsWUFBWSxnQkFBa0MsRUFBRSxVQUFnQyxFQUFFO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksNEJBQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBa0MsRUFBRSxPQUE2QjtRQUNqRixNQUFNLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsaUNBQWlDLEdBQUc7WUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBZ0IsRUFBRSxHQUFpQjtRQUMxQyx1QkFBdUI7UUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBUyxDQUFDLCtCQUErQixHQUFHLENBQUMsTUFBTSxD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QU0sRUFBRSxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUNGO0FBNUVELHNDQTRFQztBQUVELGtCQUFlLGFBQWEsQ0FBQyxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSYXZlbiBmcm9tICdyYXZlbic7XG5pbXBvcnQgeyBCYXNlUmVxdWVzdCwgQmFzZVJlc3BvbnNlIH0gZnJvbSAnLi4vaGVscGVycy9yZXNwb25zZSc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd0cy1mcmFtZXdvcmstY29tbW9uJztcbmltcG9ydCB7IEh0dHBTZXJ2ZXJFcnJvcnMgfSBmcm9tICcuL2h0dHAvSHR0cENvZGUnO1xuaW1wb3J0IEh0dHBFcnJvciBmcm9tICcuL2h0dHAvSHR0cEVycm9yJztcblxuZXhwb3J0IGludGVyZmFjZSBFcnJvclJlcG9ydGVyT3B0aW9ucyB7XG4gIHJhdmVuPzogUmF2ZW4uQ2xpZW50O1xuICBsb2dnZXI/OiBMb2dnZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JEZWZpbml0aW9ucyB7XG4gIFtjb2RlOiBzdHJpbmddOiB7XG4gICAgc3RhdHVzOiBudW1iZXI7XG4gICAgbWVzc2FnZTogbnVtYmVyO1xuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgRXJyb3JSZXBvcnRlciB7XG4gIGxvZ2dlcjogTG9nZ2VyO1xuICBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucztcbiAgZXJyb3JEZWZpbml0aW9uczogRXJyb3JEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcihlcnJvckRlZmluaXRpb25zOiBFcnJvckRlZmluaXRpb25zLCBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lcnJvckRlZmluaXRpb25zID0gZXJyb3JEZWZpbml0aW9ucztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXIgfHwgTG9nZ2VyLmdldEluc3RhbmNlKCk7XG4gIH1cblxuICBzdGF0aWMgbWlkZGxld2FyZShlcnJvckRlZmluaXRpb25zOiBFcnJvckRlZmluaXRpb25zLCBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucyk6IChBcHBsaWNhdGlvbikgPT4gdm9pZCB7XG4gICAgY29uc3QgcmVwb3J0ZXIgPSBuZXcgRXJyb3JSZXBvcnRlcihlcnJvckRlZmluaXRpb25zLCBvcHRpb25zKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZXJyb3JSZXBvcnRlck1pZGRsZXdhcmUoYXBwKSB7XG4gICAgICBhcHAudXNlKChyZXEsIHJlcykgPT4gcmVwb3J0ZXIubm90Rm91bmQocmVxLCByZXMpKTtcbiAgICAgIGFwcC51c2UoKGVycm9yLCByZXEsIHJlcywgbmV4dCkgPT4gcmVwb3J0ZXIudW5rbm93bkVycm9yKGVycm9yLCByZXEsIHJlcywgbmV4dCkpO1xuICAgIH07XG4gIH1cblxuICBub3RGb3VuZChyZXE6IEJhc2VSZXF1ZXN0LCByZXM6IEJhc2VSZXNwb25zZSkge1xuICAgIC8vIEJ1aWxkIGVycm9yIGluc3RhbmNlXG4gICAgY29uc3QgZXJyb3IgPSBuZXcgSHR0cEVycm9yKGBUaGUgcmVzb3VyY2Ugd2FzIG5vdCBmb3VuZDogJHtyZXEubWV0aG9kLnRvVXBwZXJDYXNlKCl9ICR7cmVxLm9yaWdpbmFsVXJsfWAsIDQwNCwge1xuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgb3JpZ2luYWxVcmw6IHJlcS5vcmlnaW5hbFVybCxcbiAgICB9KTtcblxuICAgIC8vIFNlbmQgdG8gU2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmF2ZW4pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yYXZlbi5jYXB0dXJlRXhjZXB0aW9uKGVycm9yLCB7XG4gICAgICAgIHJlcSxcbiAgICAgICAgbGV2ZWw6ICd3YXJuaW5nJyxcbiAgICAgICAgdGFnczogeyBzdGFja0lkOiBlcnJvci5zdGFja0lkIH0sXG4gICAgICB9IGFzIGFueSk7XG4gICAgfVxuXG4gICAgLy8gTG9nIHRvIGNvbnNvbGVcbiAgICB0aGlzLmxvZ2dlci53YXJuKGVycm9yLm1lc3NhZ2UsIGVycm9yLmRldGFpbHMpO1xuXG4gICAgLy8gUmVzcG9uZCB3aXRoIGVycm9yXG4gICAgcmVzLmVycm9yKGVycm9yKTtcbiAgfVxuXG4gIHVua25vd25FcnJvcihlcnJvcjogYW55LCByZXE6IEJhc2VSZXF1ZXN0LCByZXM6IEJhc2VSZXNwb25zZSwgbmV4dDogRnVuY3Rpb24pIHtcbiAgICBsZXQgc2VydmVyRXJyb3I6IEh0dHBFcnJvcjtcblxuICAgIC8vIFByZXBhcmUgZXJyb3IgaW5zdGFuY2VcbiAgICBpZiAoZXJyb3IgJiYgZXJyb3IuaW5uZXIgJiYgZXJyb3IuaW5uZXIgaW5zdGFuY2VvZiBIdHRwRXJyb3IpIHtcbiAgICAgIC8vIEZpeCBmb3IgT0F1dGggMi4wIGVycm9ycywgd2hpY2ggZW5jYXBzdWxhdGUgdGhlIG9yaWdpbmFsIG9uZSBpbnRvIHRoZSBcImlubmVyXCIgcHJvcGVydHlcbiAgICAgIHNlcnZlckVycm9yID0gZXJyb3IuaW5uZXIgYXMgSHR0cEVycm9yO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IgJiYgZXJyb3IgaW5zdGFuY2VvZiBIdHRwRXJyb3IpIHtcbiAgICAgIHNlcnZlckVycm9yID0gZXJyb3IgYXMgSHR0cEVycm9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXJ2ZXJFcnJvciA9IG5ldyBIdHRwRXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhdHVzIHx8IEh0dHBTZXJ2ZXJFcnJvcnMuSU5URVJOQUxfU0VSVkVSX0VSUk9SLCB7XG4gICAgICAgIGNvZGU6IGVycm9yLmNvZGUgPyBlcnJvci5jb2RlIDogdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgICBzZXJ2ZXJFcnJvci5zdGFjayA9IGVycm9yLnN0YWNrIHx8IHNlcnZlckVycm9yLnN0YWNrO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdG8gU2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmF2ZW4pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yYXZlbi5jYXB0dXJlRXhjZXB0aW9uKHNlcnZlckVycm9yLCB7XG4gICAgICAgIHJlcSxcbiAgICAgICAgbGV2ZWw6IHNlcnZlckVycm9yLnN0YXR1cyA+PSA1MDAgPyAnZXJyb3InIDogJ3dhcm5pbmcnLFxuICAgICAgICB0YWdzOiB7IHN0YWNrSWQ6IHNlcnZlckVycm9yLnN0YWNrSWQgfSxcbiAgICAgIH0gYXMgYW55KTtcbiAgICB9XG5cbiAgICAvLyBMb2cgdG8gY29uc29sZVxuICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yLm1lc3NhZ2UsIHNlcnZlckVycm9yLmRldGFpbHMpO1xuXG4gICAgLy8gVE9ETzogSGlkZSBzdGFjayBpbiBwcm9kdWN0aW9uXG4gICAgY29uc29sZS5lcnJvcihlcnJvci5zdGFjayk7XG5cbiAgICAvLyBSZXNwb25kIHdpdGggZXJyb3JcbiAgICByZXMuZXJyb3IgPyByZXMuZXJyb3Ioc2VydmVyRXJyb3IpIDogcmVzLnN0YXR1cyhzZXJ2ZXJFcnJvci5zdGF0dXMgfHwgNTAwKS5qc29uKHNlcnZlckVycm9yLnRvSlNPTigpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcnJvclJlcG9ydGVyLm1pZGRsZXdhcmU7XG4iXX0=