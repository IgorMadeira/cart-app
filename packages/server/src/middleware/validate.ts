import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { z, ZodSchema } from 'zod';
import { HTTP_STATUS, ERROR_CODES } from '@app001/shared';

declare global {
  namespace Express {
    interface Request {
      validated: Record<string, unknown>;
    }

    interface ParamsDictionary {
    [key: string]: string | string[];
    [key: number]: string;
}
  }
}

export function validate<
const Source extends 'body' | 'query' | 'params',
T extends ZodSchema, 
  >(
  schema: T, 
  source: Source,
) {
  return (
    req: Request<
    Source extends 'params' ? z.infer<T> : unknown, 
    unknown, 
    Source extends 'body' ? z.infer<T> : unknown,
    Source extends 'query' ? z.infer<T> : unknown
    >,
    res: Response<unknown>, 
    next: NextFunction) => {

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
    
    Object.defineProperty(req, source, {
      value: result.data,
      writable: false,
      configurable: false,
    });

    next();
  };
}
