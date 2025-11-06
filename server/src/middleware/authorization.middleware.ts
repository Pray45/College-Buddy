import { Request, Response, NextFunction } from "express";

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {

            const user = (req as any).user;

            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    result: false,
                    message: "Forbidden: insufficient permissions",
                    allowedRoles: roles,
                    userRole: user.role,
                });
            }

            next();
        } catch (error) {
            console.error("Error in requireRole middleware:", error);
            return res.status(500).json({
                result: false,
                message: "Internal server error in role check",
            });
        }
    };
};
