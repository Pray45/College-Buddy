import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("prisma connected");
    } catch (error) {
        console.error("prisma connection failed:", error);
        process.exit(1);
    }
}
export const prisma = new PrismaClient({ adapter })
