import { Request, Response } from "express"
import { CreateError } from "../config/Error"
import { BcryptCheck, BcryptHash } from "../utils/bcrypt";
import { Role, VerificationStatus, VerificationType } from "@prisma/client"
import { CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } from "../utils/JWT";
import { prisma } from "../config/database";

export const RegistrationHandler = async (req: Request, res: Response) => {
    try {

        const { name, email, password, role, department, enrollmentNo, teacherId } = (req.body ?? {}) as {
            name: string,
            email: string,
            password: string,
            role: Role,
            department: string,
            enrollmentNo: string,
            teacherId: string,
        }

        if (!name || !email || !password || !role || !department) {
            CreateError(404, "invalid credentials", "Registration Handler");
        }

        const departmentRecord = await prisma.department.findUnique({ where: { name: department } });
        if (!departmentRecord) {
            CreateError(404, "Department not found", "Registration Handler");
        }

        const departmentId = departmentRecord!.id;

        if (role == Role.HOD) {
            const hodExists = await prisma.hod.findFirst({ where: { departmentId } });
            if (hodExists)
                CreateError(409, "Department already has a HOD", "Registration Handler");
        }

        if (role == Role.STUDENT) {
            if (!enrollmentNo) {
                CreateError(404, "Enrollemt Number not found", "Registration Handler");
            }

            const isExistingenrollment = await prisma.student.findUnique({ where: { enrollmentNo } });
            if (isExistingenrollment) {
                CreateError(409, "enrollment number is alreadiy in use", "registration Handler");
            }
        }

        if (role == Role.PROFESSOR) {
            if (!teacherId) {
                CreateError(404, "Teacher Id not found", "Registration Handler");
            }

            const IsExistingTeacherId = await prisma.professor.findUnique({ where: { teacherId } })
            if (IsExistingTeacherId) {
                CreateError(409, "TeacherId is already in use", "registration handler")
            }
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

        if (role == Role.STUDENT) {

            const createStudent = {
                userId: user.id,
                enrollmentNo,
                departmentId
            }
            await prisma.student.create({ data: createStudent })

        } else if (role == Role.PROFESSOR) {
            const createProfessor = {
                userId: user.id,
                teacherId,
                departmentId
            }
            await prisma.professor.create({ data: createProfessor })

        } else if (role == Role.HOD) {
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
};


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

        let userData: any = await prisma.user.findUnique({
            where: { id: user?.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePic: true,
                verificationStatus: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (user?.role === "STUDENT") {
            const studentProfile = await prisma.student.findUnique({ where: { userId: user.id } });
            userData = { ...userData, studentProfile };
        }

        if (user?.role === "PROFESSOR") {
            const professorProfile = await prisma.professor.findUnique({ where: { userId: user.id } });
            userData = { ...userData, professorProfile };
        }

        if (user?.role === "HOD") {
            const hodProfile = await prisma.hod.findUnique({ where: { userId: user.id } });
            userData = { ...userData, hodProfile };
        }

        res.status(200).json({
            result: true,
            message: "loggedin successfully",
            data: { userData: userData, accessToken, refreshToken }
        });


    } catch (error) {
        console.error("error in loggin in user");
        res.status(500).json({
            result: false,
            message: "Internal server error in loginHandler",
            error
        });
    }

};


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

        console.log("TOken Refreshed...!!!");

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

};


export const getUserHandler = async (req: Request, res: Response) => {

    try {

        const idFromBody = (req.body as any)?.id;
        const idFromQuery = (req.query as any)?.id;
        const idFromParams = (req.params as any)?.id;

        const id = idFromBody || idFromQuery || idFromParams;

        if (!id) {
            CreateError(400, "didnt get user Id", "get user handler");
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            CreateError(400, "Coundlt find User from user id", "get user handler")
        }

        let addData;

        if (user?.role == "STUDENT") {
            addData = await prisma.student.findUnique({ where: { userId: user.id } })
        }
        if (user?.role == "PROFESSOR") {
            addData = await prisma.professor.findUnique({ where: { userId: user.id } })
        }
        if (user?.role == "HOD") {
            addData = await prisma.hod.findUnique({ where: { userId: user.id } })
        }

        res.status(200).json({
            result: true,
            message: "successfully get user",
            data: { user, addData }
        });

    } catch (error) {
        console.error("error in getting user:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in Getting user",
            error
        });
    }

};