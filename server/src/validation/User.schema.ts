import { z } from "zod";

export const registerSchema = z.object({
    // Make name optional (Prisma schema allows it and controller doesn't require it)
    // If provided, enforce non-empty string after trimming
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
    email: z.string().email("Invalid email"),
    enrollment_no: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    email: z.string().email().optional(),
    enrollment_no: z.string().optional(),
    password: z.string().min(6),
}).refine((data) => !!(data.email || data.enrollment_no), {
    message: 'Either email or enrollment_no is required',
    path: ['email'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;