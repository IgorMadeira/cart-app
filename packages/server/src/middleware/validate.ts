import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { HTTP_STATUS, ERROR_CODES } from '@app001/shared';

declare module 'express' {
  interface Request {
    validated: Record<string, unknown>;
  }
}

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        details[key] = details[key] || [];
        details[key].push(issue.message);
      }
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details,
        },
      });
      return;
    }
    req.validated = result.data;
    next();
  };
}
