import { CookieOptions } from "express";
import { env } from "./env";

export const COOKIE_OPTIONS: CookieOptions = {

    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

}

export const SALT_ROUNDS = 10;