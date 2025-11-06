import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { CreateError } from '../config/Error';

export const CreateAccessToken = (payload: object): string => {
    if (!env.JWT_ACCESS_SECRET) 
        CreateError(404, "JWT access secret not found", "Creating accesstoken");
    
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET!, { expiresIn: env.JWT_ACCESS_EXPIRY || '15m' });
    return token;
}

export const CreateRefreshToken = (payload: object): string => {
    if (!env.JWT_REFRESH_SECRET) 
        CreateError(404, "JWT refresh secret not found", "Creating refreshtoken");

    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET!, { expiresIn: env.JWT_REFRESH_EXPIRY || '7d' });
    return token;
}

export const VerifyAccessToken = (token: string): jwt.JwtPayload | null => {
    if (!env.JWT_ACCESS_SECRET) 
        CreateError(404, "JWT access secret not found", "Creating accesstoken");
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Access token verification failed:", error);
        return null;
    }
}

export const VerifyRefreshToken = (token: string): jwt.JwtPayload | null => {
    if (!env.JWT_REFRESH_SECRET) 
        CreateError(404, "JWT refresh secret not found", "Creating refreshtoken");

    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Refresh token verification failed:", error);
        return null;
    }
}