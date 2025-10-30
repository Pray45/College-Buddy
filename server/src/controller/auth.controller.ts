import type { Request, Response } from 'express';
import prisma from '../config/Prisma_connect';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/constants';
import { create_Access_Token, create_Refresh_Token, verifyRefreshToken } from '../utils/JWT';

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

        const createData: any = { 
            email, 
            password: hashed, 
            enrollment_no
        };
        if (name) createData.name = name;

        const user = await prisma.user.create({ data: createData });

        const accessToken = create_Access_Token({ userId: user.id });
        const refreshToken = create_Refresh_Token({ userId: user.id });

        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            enrollment_no: user.enrollment_no,
            createdAt: user.createdAt
        };

        return res.status(201).json({
            message: 'User created successfully',
            result: true,
            user: safeUser,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('RegisterHandler error:', error);
        return res.status(500).json({ message: 'Internal server error', result: false });
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
        if (!passwordMatches) return res.status(401).json({ message: 'Invalid credentials', result: false });

        const accessToken = create_Access_Token({ userId: user.id });
        const refreshToken = create_Refresh_Token({ userId: user.id });

        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            enrollment_no: user.enrollment_no,
            createdAt: user.createdAt
        };

        return res.status(200).json({
            message: 'Login successful',
            result: true,
            user: safeUser,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('LoginHandler error:', error);
        return res.status(500).json({ message: 'Internal server error', result: false });
    }
};



export const RefreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided', result: false });
        }

        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded || !decoded.userId) {
            return res.status(403).json({ message: 'Invalid or expired refresh token', result: false });
        }

        // Generate new tokens
        const newAccessToken = create_Access_Token({ userId: decoded.userId });
        const newRefreshToken = create_Refresh_Token({ userId: decoded.userId });

        return res.status(200).json({
            message: 'Tokens refreshed successfully',
            result: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('RefreshTokenHandler error:', error);
        return res.status(500).json({ message: 'Internal server error', result: false });
    }
}