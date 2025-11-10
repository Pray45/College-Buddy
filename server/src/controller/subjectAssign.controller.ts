import { Request, Response } from "express"
import { CreateError } from "../config/Error"
import prisma from "../config/Prisma_connect"


export const assignTeacherHandler = async (req: Request, res: Response) => {

    try {

        const { divisionId, professorId, subjectId } = req.body ?? {} as {
            divisionId: string,
            professorID: string,
            subjectId: string
        }

        if (!divisionId || !professorId || !subjectId) {
            CreateError(400, "invalid creadentials", "assign teacher handler");
        }

        const division = await prisma.division.findUnique({ where: { id: divisionId } });
        if (!division) {
            CreateError(400, "invalid division", "assign teacher handler");
        }

        const professor = await prisma.professor.findUnique({ where: { userId: professorId } });
        if (!professor) {
            CreateError(400, "invalid professorId", "assign professor handler");
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            CreateError(400, "invalid subject", "assign teacher handler");
        }

        const isExisting = await prisma.divisionSubjectAssignment.findFirst({ where: { subjectId, divisionId } });
        if (isExisting) {
            CreateError(400, "subject is already assigned", "assign professor handler");
        }

        const assignment = await prisma.divisionSubjectAssignment.create({
            data: {
                divisionId,
                subjectId,
                professorId: professor?.id,
            },
            include: {
                subject: { select: { name: true, code: true } },
                professor: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
        });

        res.status(201).json({
            result: true,
            message: "Subject assigned to division successfully",
            data: assignment,
        });

    } catch (error) {
        console.error("error in assign teacher handler", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in assign teacher handler",
            error
        });
    }

}

export const getAssignedHandler = async (req: Request, res: Response) => {

    try {

        const { divisionId } = (req.body ?? {}) as { divisionId: string }

        if (!divisionId) {
            CreateError(400, "invalid division ID", "get assigned subject handler");
        }

        const subjects = await prisma.divisionSubjectAssignment.findMany({ where: { divisionId } });
        if (!subjects) {
            CreateError(404, "invalid divison Id", "get assigned subject handler");
        }

        res.status(200).json({
            result: true,
            message: "assigned subject fetched successfully",
            data: { subjects }
        });

    } catch (error) {
        console.error("error in get assigned subject")
        res.status(500).json({
            result: false,
            message: "Internal server error in getting assigned subject",
            error
        });
    }

}

export const deleteAssignedHanlder = async (req: Request, res: Response) => {

    try {

        const { id } = (req.body ?? {}) as { id: string }

        if (!id) {
            CreateError(400, "invalid id", "deleting assigned handler");
        }

        const assignedsub = await prisma.divisionSubjectAssignment.findUnique({ where: { id } });
        if (!assignedsub) {
            CreateError(404, "assigned subject not found", "delete assigned handler");
        }

        await prisma.divisionSubjectAssignment.delete({ where: { id } });

        res.status(200).json({
            result: true,
            message: "deleted assigned subject successfully"
        });

    } catch (error) {
        console.error("error in delete assigned hadnler");
        res.status(500).json({
            result: false,
            message: "INternal server error in deleting assigned subject handler",
            error
        });
    }

}