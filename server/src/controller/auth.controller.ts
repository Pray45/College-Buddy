import type { Request, Response } from 'express';
import prisma from '../config/Prisma_connect';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/constants';
import { createJWT } from '../utils/JWT';


export const RegisterHandler = async (req: Request, res: Response) => {
    try {
        const { email, password, enrollment_no, name } = (req.body ?? {}) as {
            email?: string;
            password?: string;
            enrollment_no?: string;
            name?: string;
        };

        if (!email || !password || !enrollment_no)
            return res.status(400).json({ message: 'email, password and enrollment_no are required', result: false });

        const existingByEmail = await prisma.user.findUnique({ where: { email } });
        if (existingByEmail) return res.status(409).json({ message: 'Email already in use', result: false });

        const existingByEnrollment = await prisma.user.findUnique({ where: { enrollment_no } });
        if (existingByEnrollment) return res.status(409).json({ message: 'Enrollment number already in use', result: false });

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const create = await prisma.user.create({ data: { email, password: hashed, enrollment_no, name: name ?? null } });
        const token = await createJWT({ userId: create.id });

        const safeUser = {
            id: create.id,
            email: create.email,
            name: create.name,
            enrollment_no: create.enrollment_no,
            createdAt: create.createdAt
        };

        return res.status(201).json({ message: 'User created', result: true, user: safeUser, token });

    } catch (error) {
        console.error('RegisterHandler error:', error);
        return res.status(500).json({ message: 'internal server error', result: false });
    }
};


export const LoginHandler = async (req: Request, res: Response) => {
    try {
        const { email, enrollment_no, password } = (req.body ?? {}) as {
            email?: string;
            enrollment_no?: string;
            password?: string;
        };

        if (!password || (!email && !enrollment_no)) {
            return res.status(400).json({ message: 'Provide password and either email or enrollment_no', result: false });
        }

        // Find by email or enrollment_no
        const user = email
            ? await prisma.user.findUnique({ where: { email } })
            : await prisma.user.findUnique({ where: { enrollment_no } });

        if (!user) return res.status(401).json({ message: 'Invalid credentials', result: false });

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return res.status(401).json({ message: 'Password doesn\'t match', result: false });

        const token = await createJWT({ userId: user.id });

        // return safe user object
        const safeUser = { id: user.id, email: user.email, enrollment_no: user.enrollment_no, createdAt: user.createdAt };

        return res.status(200).json({ message: 'Login successful', result: true, user: safeUser, token });
    } catch (error) {
        console.error('LoginHandler error:', error);
        return res.status(500).json({ message: 'internal server error', result: false });
    }
};


export default { LoginHandler, RegisterHandler };