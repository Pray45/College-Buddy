import { Request, Response } from "express";
import {prisma} from "../config/database"
import { CreateError } from "../config/Error";
import { VerificationStatus } from "@prisma/client";
import {CreateAccessToken, CreateRefreshToken, VerifyAccessToken} from "../utils/JWT";
import {JwtPayload} from "jsonwebtoken";

export const getPendingRequestsHandler = async (req: Request, res: Response) => {

    try {

        const PendingRequests = await prisma.verificationRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                User_VerificationRequest_userIdToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        verificationStatus: true,
                    }
                }
            }
        })

        if (!PendingRequests) {
            CreateError(404, "Pendiong Request notfound", "get Pending Requests");
        }

        const filteredRequests = [];
        for (const request of PendingRequests) {
            const user = request.User_VerificationRequest_userIdToUser;
            
            if (user && user.verificationStatus === 'APPROVED') {
                
                await prisma.verificationRequest.delete({
                    where: { id: request.id }
                });
            } else {
                filteredRequests.push(request);
            }
        }

        res.status(200).json({
            result: true,
            message: "Successfully get all Pending Requests",
            data: { PendingRequests: filteredRequests }
        })

    } catch (error) {
        console.error("error in getting Pending Verification Requests", error);
        res.status(500).json({
            result: false,
            message: "Internal server Error at get Verification Request ",
            error
        })
    }
};

export const createRequestHandler = async (req: Request, res: Response) => {

    try {

        const { approverId, requestId, reason, action } = (req.body ?? {}) as {
            approverId: string,
            requestId: string,
            reason: string,
            action: "APPROVE" | "REJECT";
        };

        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        const decoded = VerifyAccessToken(token!) as JwtPayload;
        const userId = decoded?.payload?.id || decoded?.id;

        const approver = await prisma.user.findUnique({ where: { id: userId } })
        if (!approver) {
            CreateError(404, "Approver not found in database", "create request handler");
        }

        if (approver?.verificationStatus !== "APPROVED") {
            CreateError(404, "Approver is not Verified", "create request handler");
        }

        if (approver?.role !== "HOD" && "PROFESSOR") {
            CreateError(400, "Approver is not Authorized", "create request handler");
        }

        const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } })
        if (!request) {
            CreateError(404, "Request not found in database", "create request handler");
        }

        if (request?.status !== "PENDING") {
            CreateError(409, "This request is already processed", "create request handler");
        }

        if (action == "APPROVE") {

            await prisma.$transaction(async (trx) => {
                await trx.verificationRequest.update({
                    where: { id: requestId },
                    data: {
                        status: VerificationStatus.APPROVED,
                        approvedById: userId,
                        reason: reason
                    }
                })
            })

            const payload = { id: request?.userId }
            const refreshToken = CreateRefreshToken({ payload });
            const accessToken = CreateAccessToken({ payload });


            const userData = await prisma.user.update({
                where: { id: request?.userId },
                data: {
                    verificationStatus: VerificationStatus.APPROVED,
                    refreshToken
                }
            })



            res.status(200).json({
                result: true,
                message: "Successfully approved request",
                data: { userData, accessToken }
            });


        } else if (action == "REJECT") {

            await prisma.student.deleteMany({ where: { userId: request?.userId } })
            await prisma.professor.deleteMany({ where: { userId: request?.userId } })
            await prisma.verificationRequest.deleteMany({ where: { userId: request?.userId } })
            await prisma.user.deleteMany({ where: { id: request?.userId } })

            res.status(200).json({
                result: true,
                message: "Successfully rejected request and deleted related user data",
            });

        }

    } catch (error) {
        console.error("error in approving create Request");
        res.status(500).json({
            result: false,
            message: "Internal server error in create Request Handler",
            error
        });
    }

};