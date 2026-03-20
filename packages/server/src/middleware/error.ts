import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ err: error, path: req.path, method: req.method }, 'Unhandled error');

    if (res.headersSent) return;

    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  };
}
