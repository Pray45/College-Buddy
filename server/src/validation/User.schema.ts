import { z } from "zod";

export const registerSchema = z.object({

    name: z.string().trim().min(1, 'Name cannot be empty'),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["STUDENT", "PROFESSOR", "ADMIN"]),
    department: z.string().trim().min(1, "Department cannot be empty"),
    enrollmentNo: z.string().length(12, "Enrollment number must be exactly 12 digits").optional(),
    teacherId: z.string().length(12, "Teacher ID must be exactly 12 digits").optional()
}).refine((data) => {
    if (data.role === 'STUDENT') return !!data.enrollmentNo && !data.teacherId;
    if (data.role === 'PROFESSOR') return !!data.teacherId && !data.enrollmentNo;
    if (data.role === 'ADMIN') return !data.enrollmentNo && !data.teacherId;
    return false;
}, {
    message: "Invalid field combination: STUDENT requires enrollment_no, PROFESSOR requires teacherId, ADMIN should not have either.",
    path: ['role']
});



export const loginSchema = z.object({

    role: z.enum(["STUDENT", "PROFESSOR", "ADMIN"]),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),

});

export type RegisterInput = z.infer<typeof registerSchema>;