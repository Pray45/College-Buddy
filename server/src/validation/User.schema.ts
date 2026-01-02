import { z } from "zod";

export const registerSchema = z.object({

    name: z.string().trim().min(1, 'Name cannot be empty'),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["STUDENT", "PROFESSOR", "HOD"]),
    department: z.string().trim().min(1, "Department cannot be empty"),
    enrollmentNo: z.string().length(12, "Enrollment number must be exactly 12 digits").optional(),
    teacherId: z.string().length(12, "Teacher ID must be exactly 12 digits").optional(),
    semester: z.number().int().min(1).max(8).optional()
}).refine((data) => {
    if (data.role === 'STUDENT') return !!data.enrollmentNo && !!data.semester && !data.teacherId;
    if (data.role === 'PROFESSOR') return !!data.teacherId && !data.enrollmentNo && !data.semester;
    if (data.role === 'HOD') return !data.teacherId && !data.enrollmentNo && !data.semester;
    return false;
}, {
    message: "Invalid field combination: STUDENT requires enrollment_no and semester, PROFESSOR requires teacherId, HOD should not have either.",
    path: ['role']
});



export const loginSchema = z.object({

    role: z.enum(["STUDENT", "PROFESSOR", "HOD"]),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),

});

export type RegisterInput = z.infer<typeof registerSchema>;