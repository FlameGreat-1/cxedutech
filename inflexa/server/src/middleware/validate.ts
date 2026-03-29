import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array().map((e) => ({
          field: e.type === 'field' ? e.path : undefined,
          message: e.msg,
        })),
      });
      return;
    }

    next();
  };
}
