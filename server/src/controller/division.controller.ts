import { Request, Response } from 'express';
import { CreateError } from '../config/Error';
import {prisma} from '../config/database';

export const createDivisionHandler = async (req: Request, res: Response) => {
    try {
        const { name, semesterId, departmentId } = req.body;

        if (!name || !semesterId || !departmentId)
            CreateError(400, "Missing fields: name, semesterId, departmentId, hodId", "createDivisionHandler");

        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
            CreateError(404, "Department not found", "createDivisionHandler");
        }

        const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
        if (!semester) {
            CreateError(404, "Semester not found", "createDivisionHandler");
        }


        const existingDivision = await prisma.division.findFirst({ where: { name, semesterId } });
        if (existingDivision) {
            CreateError(409, `Division '${name}' already exists for this semester`, "createDivisionHandler");
        }

        const division = await prisma.division.create({
            data: {
                name,
                department: {
                    connect: { id: departmentId }
                },
                Semester: {
                    connect: { id: semesterId }
                },
                updatedAt: new Date(),
            },
        });

        res.status(201).json({
            result: true,
            message: "Division created successfully",
            data: { division },
        });
    } catch (error: any) {
        console.error("Error in createDivisionHandler:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error in createDivisionHandler",
            error
        });
    }
};


export const getDivisionHandler = async (req: Request, res: Response) => {
    try {
        const { semesterId } = req.body;
        if (!semesterId) {
            CreateError(400, "Semester ID missing", "getDivisions Handler");
        }

        const divisions = await prisma.division.findMany({
            where: { semesterId },
            include: {
                Student: {
                    include: {
                        User: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        res.status(200).json({
            result: true,
            message: "Fetched divisions successfully",
            data: { divisions },
        });
    } catch (error: any) {
        console.error("Error in getDivisions Handler:", error);
        res.status(error.statusCode || 500).json({
            result: false,
            message: "Internal server error in getDivisions Handler",
            error
        });
    }
};


export const assignStudentsHandler = async (req: Request, res: Response) => {
    try {
        const { divisionId, studentIds } = req.body;

        if (!divisionId || !studentIds?.length)
            CreateError(400, "Missing fields: divisionId, studentIds, hodId", "assignStudentsToDivisionHandler");

        const division = await prisma.division.findUnique({ where: { id: divisionId } });
        if (!division) {
            CreateError(404, "Division not found", "assignStudentsToDivisionHandler");
        }

        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, divisionId: true, User: { select: { name: true } } },
        });

        if (students.length !== studentIds.length) {
            CreateError(400, "One or more student IDs are invalid", "assignStudentsToDivisionHandler");
        }

        const alreadyAssigned = students.filter((s) => s.divisionId !== null);
        if (alreadyAssigned.length > 0) {
            const names = alreadyAssigned.map((s) => s.User.name).join(", ");
            CreateError(
                409,
                `These students are already in a division: ${names}`,
                "assignStudentsToDivisionHandler"
            );
        }

        await prisma.$transaction(
            studentIds.map((sid: string) =>
                prisma.student.update({
                    where: { id: sid },
                    data: { divisionId },
                })
            )
        );

        res.status(200).json({
            result: true,
            message: `Assigned ${studentIds.length} students to division '${division!.name}' successfully`
        });
    } catch (error: any) {
        console.error("Error in assignStudentsToDivisionHandler:", error);
        res.status(error.statusCode || 500).json({
            result: false,
            message: "Internal server error in assignStudentsToDivisionHandler",
            error
        });
    }
};

export const removeStudentHandler = async (req: Request, res: Response) => {

    try {

        const { divisionId, studentIds } = req.body;

        if (!divisionId || !studentIds?.length)
            CreateError(400, "Missing fields: divisionId, studentIds, hodId", "remove Students from Division Handler");

        const division = await prisma.division.findUnique({ where: { id: divisionId } });
        if (!division) {
            CreateError(404, "Division not found", "remove Students from Division Handler");
        }

        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: {
                id: true, divisionId: true,
                User: { select: { name: true } }
            }
        });

        if (students.length !== studentIds.length) {
            CreateError(400, "One or more student IDs are invalid", "remove Students from Division Handler");
        }

        const alreadyUnassigned = students.filter((s) => s.divisionId === null);

        if (alreadyUnassigned.length > 0) {
            const names = alreadyUnassigned.map((s) => s.User.name).join(", ");
            CreateError(
                409,
                `These students are dont havea division: ${names}`,
                "remove Students from Division Handler"
            );
        }

        await prisma.$transaction(
            studentIds.map((sid: string) =>
                prisma.student.update({
                    where: { id: sid },
                    data: { divisionId: null },
                })
            )
        )

        res.status(200).json({
            result: true,
            message: `removed ${studentIds.length} students to division '${division!.name}' successfully`
        });



    } catch (error: any) {
        console.error("Error in remove Students from Division Handler:", error);
        res.status(error.statusCode || 500).json({
            result: false,
            message: "Internal server error in remove Students from Division Handler",
            error
        });
    }

};


export const getStudents = async (req: Request, res: Response) => {
    try {
        const { divisionId } = req.body;
        if (!divisionId) {
            CreateError(400, "Semester ID missing", "getstudent Handler");
        }

        const students = await prisma.division.findUnique({
            where: { id: divisionId },
            include: {
                Student: {
                    include: {
                        User: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        if (!students) {
            CreateError(300, "invalid divisionId", "getstudent Handler");
        }

        res.status(200).json({
            result: true,
            message: "Fetched divisions successfully",
            data: { students },
        });
    } catch (error: any) {
        console.error("Error in getstudent Handler:", error);
        res.status(error.statusCode || 500).json({
            result: false,
            message: "Internal server error in getstudent Handler",
            error
        });
    }
};