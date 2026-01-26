import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorTree = z.treeifyError(result.error);

      return res.status(400).json({
        message: 'Invalid request data',
        errors: errorTree,
      });
    }

    req.body = result.data;
    next();
  };
}
