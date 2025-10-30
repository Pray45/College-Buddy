import dotenv from "dotenv";
dotenv.config();

export const env = {

    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    
    DATABASE_URL: process.env.DATABASE_URL,

    // JWT SECRETS AND EXPIRY TIMES

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,

}