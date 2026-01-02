import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import {prisma} from "../config/database";
import { CreateError } from "../config/Error";
import { Role } from "../generated/prisma/enums";
import { VerifyAccessToken } from "../utils/JWT";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
}


export const requireRole =
    (...allowedRoles: Role[]) =>
        async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                const authHeader = req.headers.authorization;

                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    CreateError(401, "Authorization token missing", "requireRole");
                }

                const token = authHeader?.split(" ")[1];

                const decoded = VerifyAccessToken(token!) as JwtPayload;
                const userId = decoded?.payload?.id || decoded?.id;

                if (!userId) {
                    CreateError(401, "Invalid token payload", "requireRole");
                }

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, role: true },
                });

                if (!user) {
                    CreateError(404, "User not found", "requireRole");
                }

                if (!allowedRoles.includes(user!.role)) {
                    CreateError(403, `Access denied for role: ${user!.role}`, "requireRole");
                }

                req.user = user!;
                next();
            } catch (error: any) {
                console.error("Role middleware error:", error);
                res.status(error.statusCode || 401).json({
                    result: false,
                    message: "Unauthorized access",
                    error
                });
            }
        };
