import { Request, Response } from 'express'
import { CreateError } from '../config/Error';
import { prisma } from "../config/database"


export const createSubjectHandler = async (req: Request, res: Response) => {
    try {

        const { name, code, description, departmentId, semesterId } = (req.body ?? {}) as {
            name: string,
            code: string,
            description: string,
            departmentId: string | number,
            semesterId: number,
        }

        if (!name || !code || !description || !departmentId || !semesterId) {
            CreateError(400, "Invalid credentials", "create subject handler");
        }

        const department = await prisma.department.findUnique({ where: { id: departmentId.toString() } });
        if (!department) {
            CreateError(404, "Department not found", "create Subject Handler");
        }

        const sem = await prisma.semester.findFirst({
            where: {
                departmentId: departmentId.toString(),
                number: semesterId,
            },
        });

        if (!sem) {
            CreateError(404, "Semester not found", "createDivisionHandler");
        }

        const isExistingSubject = await prisma.subject.findFirst({ where: { departmentId : departmentId.toString(), semesterId : sem!.id, name, code } });
        if (isExistingSubject) {
            CreateError(400, "this subject is existing", "create subject handler");
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                code,
                description,
                departmentId : departmentId.toString(),
                semesterId : sem!.id
            }
        });

        res.status(201).json({
            result: true,
            message: "created subject successfully",
            data: { subject }
        });


    } catch (error) {
        console.error("error in creating subject", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in create subject handler",
            error
        });
    }
};

export const getSubjectByDeoartrmentHandler = async (req: Request, res: Response) => {

    try {

        const { departmentId } = (req.body ?? {}) as { departmentId: string }

        if (!departmentId) {
            CreateError(400, "invalid credantials", "get subject ny department handler");
        }

        const subject = await prisma.subject.findMany({ where: { departmentId } });

        if (!subject) {
            CreateError(404, "invalid semsterId or no subject ofund", "get subject handler");
        }

        res.status(200).json({
            result: true,
            message: "get all subject of department successfully",
            data: { subject }
        });

    } catch (error) {
        console.error("error in get subject", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in get subject handler",
            error
        });
    }

};
export const getAllSubjectsHandler = async (req: Request, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: [
                { departmentId: 'asc' },
                { semesterId: 'asc' },
                { name: 'asc' }
            ]
        });

        res.status(200).json({
            result: true,
            message: "Retrieved all subjects successfully",
            data: { subjects }
        });
    } catch (error) {
        console.error("error in getting all subjects", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in get all subjects handler",
            error
        });
    }
};
export const getSubjectHandler = async (req: Request, res: Response) => {

    try {

        const { semesterId } = (req.body ?? {}) as { semesterId: string }

        if (!semesterId) {
            CreateError(400, "invalid credantials", "get subject handler");
        }

        const subject = await prisma.subject.findMany({ where: { semesterId } });

        if (!subject) {
            CreateError(404, "invalid semsterId or no subject ofund", "get subject handler");
        }

        res.status(200).json({
            result: true,
            message: "get all subject successfully",
            data: { subject }
        });

    } catch (error) {
        console.error("error in get subject", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in get subject handler",
            error
        });
    }

};

export const deleteSubjectHanlder = async (req: Request, res: Response) => {

    try {

        const { subjectId } = (req.body ?? {}) as { subjectId: string };

        if (!subjectId) {
            CreateError(400, "invalid credentials", "delete subject hanlder");
        }

        await prisma.$transaction([
            prisma.divisionSubjectAssignment.deleteMany({ where: { subjectId } }),
            prisma.studentSubject.deleteMany({ where: { subjectId } }),
            prisma.subject.delete({ where: { id: subjectId } }),
        ]);

        res.status(200).json({
            result: true,
            message: "Subject and related records deleted successfully",
        });


    } catch (error) {
        console.error("error in deleting subject");
        res.status(500).json({
            result: false,
            message: "Internal server error in delete subject handler",
            error
        });
    }

};