import { Request, Response } from 'express'
import { CreateError } from '../config/Error';
import prisma from '../config/Prisma_connect';


export const createSubjectHandler = async (req: Request, res: Response) => {
    try {

        const { name, code, description, departmentId, semesterId, hodId } = (req.body ?? {}) as {
            name: string,
            code: string,
            description: string,
            departmentId: string,
            semesterId: string,
            hodId: string
        }

        if (!name || !code || !description || !departmentId || !semesterId || !hodId) {
            CreateError(400, "Invalid credentials", "create subject handler");
        }

        const isHod = await prisma.user.findUnique({ where: { id: hodId } });
        if (isHod?.role !== "HOD") {
            CreateError(400, "only admin can create subjects", "create subject handler");
        }

        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
            CreateError(404, "Department not found", "create Subject Handler");
        }

        const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
        if (!semester) {
            CreateError(404, "Semester not found", "create Subject Handler");
        }

        const isExistingSubject = await prisma.subject.findFirst({ where: { departmentId, semesterId, name, code } });
        if (isExistingSubject) {
            CreateError(400, "this subject is existing", "create subject handler");
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                code,
                description,
                departmentId,
                semesterId
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
}

export const getSubjectHandler = async (req: Request, res: Response) => {

    try {

        const { semesterId } = (req.body ?? {}) as { semesterId: string }

        if (!semesterId) {
            CreateError(400, "invalid credantials", "get subject handler");
        }

        const subject = await prisma.semester.findUnique({ where: { id: semesterId } });

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

}