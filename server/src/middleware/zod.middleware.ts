import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod'

const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((err: any) => ({
                path: (err.path && err.path.length) ? err.path.join('.') : '(root)',
                message: err.message,
                code: err.code,
            }));

            try {
                console.error('Zod validation failed for %s %s. Request body: %s', req.method, req.originalUrl, JSON.stringify(req.body));
                console.error('Zod formatted errors: %s', JSON.stringify(result.error.format(), null, 2));
            } catch (logErr) {
                console.error('Zod validation failed and logging the formatted error failed:', logErr);
            }

            return res.status(400).json({
                message: 'Validation failed',
                result: false,
                errors
            });
        }

        next();
    };
};

export default validate;