import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const createError = (message: string) => {
    const error = { name: 'Error', message };
    throw error;
};

export const create_Access_Token = (payload: object): string => {
    if (!env.JWT_ACCESS_SECRET) createError("JWT_ACCESS_SECRET is not defined in environment variables");
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET!, { expiresIn: env.JWT_ACCESS_EXPIRY || '15m' });
    return token;
}

export const create_Refresh_Token = (payload: object): string => {
    if (!env.JWT_REFRESH_SECRET) createError("JWT_REFRESH_SECRET is not defined in environment variables");
    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET!, { expiresIn: env.JWT_REFRESH_EXPIRY || '7d' });
    return token;
}

export const verifyAccessToken = (token: string): jwt.JwtPayload | null => {
    if (!env.JWT_ACCESS_SECRET) createError("JWT_ACCESS_SECRET is not defined in environment variables");
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Access token verification failed:", error);
        return null;
    }
}

export const verifyRefreshToken = (token: string): jwt.JwtPayload | null => {
    if (!env.JWT_REFRESH_SECRET) createError("JWT_REFRESH_SECRET is not defined in environment variables");
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Refresh token verification failed:", error);
        return null;
    }
}

export const verifyToken = verifyAccessToken;
