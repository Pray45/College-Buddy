import { Request, Response } from "express"
import { CreateError } from "../config/Error"
import prisma from "../config/Prisma_connect";
import { BcryptCheck, BcryptHash } from "../utils/bcrypt";
import { Role, VerificationStatus, VerificationType } from "@prisma/client";
import { CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } from "../utils/JWT";

export const RegistrationHandler = async (req: Request, res: Response) => {
    try {

        const { name, email, password, role, departmentId, enrollmentNo, teacherId } = (req.body ?? {}) as {
            name: string,
            email: string,
            password: string,
            role: Role,
            departmentId: string,
            enrollmentNo: string,
            teacherId: string,
        }

        if (!name || !email || !password || !role || !departmentId) {
            CreateError(404, "invalid credentials", "Registration Handler");
        }

        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
            CreateError(404, "Department not found", "Registration Handler");
        }

        if (role == "HOD") {
            const hodExists = await prisma.hod.findFirst({ where: { departmentId } });
            if (hodExists)
                CreateError(409, "Department already has a HOD", "Registration Handler");
        }

        if (role == "STUDENT") {
            if (!enrollmentNo)
                CreateError(404, "Enrollemt Number not found", "Registration Handler");

            const isExistingenrollment = await prisma.student.findUnique({ where: { enrollmentNo } });
            if (isExistingenrollment)
                CreateError(409, "enrollment number is alreadiy in use", "registration Handler");
        }

        if (role == "PROFESSOR") {
            if (!teacherId)
                CreateError(404, "Teacher Id not found", "Registration Handler");

            const IsExistingTeacherId = await prisma.professor.findUnique({ where: { teacherId } })
            if (IsExistingTeacherId)
                CreateError(409, "TeacherId is already in use", "registration handler");
        }

        const isExisting = await prisma.user.findUnique({ where: { email } });
        if (isExisting) {
            CreateError(409, "Email Already Exists", "Registration Handler");
        }

        const hashedPass = await BcryptHash(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPass!,
                role: role as Role,
                verificationStatus: VerificationStatus.PENDING
            },
        });

        if (role == "STUDENT") {

            const createStudent = {
                userId: user.id,
                enrollmentNo,
                departmentId
            }
            await prisma.student.create({ data: createStudent })

        } else if (role == "PROFESSOR") {
            const createProfessor = {
                userId: user.id,
                teacherId,
                departmentId
            }
            await prisma.professor.create({ data: createProfessor })

        } else if (role == "HOD") {
            const createHod = {
                userId: user.id,
                departmentId
            }
            await prisma.hod.create({ data: createHod });
        }


        await prisma.verificationRequest.create({
            data: {
                userId: user.id,
                type: VerificationType.REGISTRATION,
                status: VerificationStatus.PENDING,
                updatedData: user,
                reason: "Registering User"
            }
        })

        res.status(201).json({
            result: true,
            message: "Registration Request sent Successfully",
            data: { userData: user }
        });

    } catch (error) {
        console.log("Internal server error : ", error)
        res.status(500).json({
            result: false,
            message: "Internal server error in Registration Handler",
            error
        })
    }
}


export const loginHandler = async (req: Request, res: Response) => {

    try {

        const { role, email, password } = (req.body ?? {}) as {
            role?: Role
            email?: string,
            password?: string,
        }

        if (!email || !password || !role) {
            CreateError(404, "invalid credentials", "login hnadler");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            CreateError(404, "email not found", "login handler")
        }

        if (role != user?.role) {
            CreateError(401, "Not authorized for this role", "login handler");
        }

        if (user?.verificationStatus != "APPROVED") {
            CreateError(401, "Registration request is not approved", "login handler");
        }

        if (role != user?.role) {
            CreateError(401, "Not authorized for this role", "login handler");
        }

        const isValid = await BcryptCheck(password, user?.password!)
        if (!isValid) {
            CreateError(400, "Password didn't match", "login handler");
        }

        const payload = { id: user?.id }
        const accessToken = CreateAccessToken({ payload });
        const refreshToken = CreateRefreshToken({ payload });

        await prisma.user.update({ where: { id: user?.id }, data: { refreshToken } })
        const loginUser = await prisma.user.findUnique({ where: { id: user?.id } })

        res.status(200).json({
            result: true,
            message: "loggedin successfully",
            data: { userData: loginUser, accessToken, refreshToken }
        });


    } catch (error) {
        console.error("error in loggin in user");
        res.status(500).json({
            result: false,
            message: "Internal server error in loginHandler",
            error
        });
    }

}


export const refreashTokenHandler = async (req: Request, res: Response) => {

    try {

        const { refreshToken } = req.body as { refreshToken?: string };

        if (!refreshToken) {
            CreateError(400, "token not found", "refresh tokern handler");
        }


        const decoded = VerifyRefreshToken(refreshToken!)

        if (!decoded) {
            CreateError(400, "token did not match", "refresh token handler");
        }

        const user = await prisma.user.findUnique({ where: { id: decoded?.payload.id } });
        if (!user)
            CreateError(400, "couldnt extract user from refreshtoken", "refreshtoken handler");

        if (!user?.refreshToken || user.refreshToken !== refreshToken) {
            await prisma.user.update({
                where: { id: user?.id },
                data: { refreshToken: null },
            });
            CreateError(403, "Refresh token mismatch or reuse detected", "refreshTokenHandler");
        }


        const payload = { id: user?.id };
        const newAccessToken = CreateAccessToken({ payload });
        const newRefreshToken = CreateRefreshToken({ payload });

        await prisma.user.update({
            where: { id: user?.id },
            data: { refreshToken: newRefreshToken },
        });

        res.status(200).json({
            result: true,
            message: "Tokens refreshed successfully",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });


    } catch (error) {
        console.error("error in refreshtoken handler");
        res.status(500).json({
            result: false,
            message: "Internal server error in refresh token handler",
            error
        });
    }

}


export const getUserHandler = async (req: Request, res: Response) => {

    try {

        const { id } = req.body as { id?: string };

        if (!id) {
            CreateError(400, "didnt get user Id", "get user handler");
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            CreateError(400, "Coundlt find User from user id", "get user handler")
        }

        res.status(200).json({
            result: true,
            message: "successfully get user",
            data: user
        });

    } catch (error) {
        console.error("error in getting user");
        res.status(500).json({
            result: false,
            message: "Internal server error in Getting user",
            error
        });
    }

}