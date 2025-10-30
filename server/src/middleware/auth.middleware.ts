import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/JWT";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('authorization');

    if (!authHeader || !(authHeader as any).startsWith("Bearer "))
        return res.status(401).json({ message: "Unauthorized: No token provided", result: false });

    const token = (authHeader as any).substring(7); // Remove "Bearer " prefix

    if (!token)
        return res.status(401).json({ message: "Unauthorized: Invalid token", result: false });

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token", result: false });
    }

    (req as any).user = decoded;
    next();
}