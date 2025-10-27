import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const  createJWT = async (payload: object): Promise<string> => {

    if(!env.JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

    const token = await jwt.sign(payload, env.JWT_SECRET!, { expiresIn: env.JWT_EXPIRY! });
    return token;

}

