import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod'

/**
 * Validation middleware for request body using Zod schemas
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            const formattedErrors = result.error.format();
            
            return res.status(400).json({ 
                message: 'Zod validation failed',
                result: false,
                errors: formattedErrors
            });
        }
        
        next();
    };
};

export default validate;