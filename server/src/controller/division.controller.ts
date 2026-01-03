import { Request, Response } from 'express';
import { CreateError } from '../config/Error';
import { prisma } from '../config/database';

export const createDivisionHandler = async (req: Request, res: Response) => {
    try {
        const { name, department, semester } = req.body;

        if (!name || !semester || !department) {
            CreateError(400, "Missing fields", "createDivisionHandler");
        }

        const dept = await prisma.department.findUnique({
            where: { id: department.toString() },
        });

        if (!dept) {
            CreateError(404, "Department not found", "createDivisionHandler");
        }

        const sem = await prisma.semester.findFirst({
            where: {
                departmentId: department.toString(),
                number: semester,
            },
        });

        if (!sem) {
            CreateError(404, "Semester not found", "createDivisionHandler");
        }

        const existingDivision = await prisma.division.findFirst({
            where: {
                name,
                semesterId: sem!.id,
            },
        });

        if (existingDivision) {
            CreateError(
                409,
                `Division '${name}' already exists for this semester`,
                "createDivisionHandler"
            );
        }

        const division = await prisma.division.create({
            data: {
                name,
                departmentId: department.toString(),
                semesterId: sem!.id,
            },
        });

        res.status(201).json({
            result: true,
            message: "Division created successfully",
            data: division,
        });
    } catch (error: any) {
        console.error("Error in createDivisionHandler:", error);
        res.status(500).json({
            result: false,
            message: error.message ?? "Internal server error",
        });
    }
};



export const getDivisionHandler = async (req: Request, res: Response) => {
    try {

        const divisions = await prisma.division.findMany({
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

        if (!divisionId || !Array.isArray(studentIds) || studentIds.length === 0) {
            throw CreateError(
                400,
                "Missing or invalid fields: divisionId, studentIds",
                "assignStudentsHandler"
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const division = await tx.division.findUnique({
                where: { id: divisionId },
                select: { id: true, name: true },
            });

            if (!division) {
                throw CreateError(404, "Division not found", "assignStudentsHandler");
            }

            const students = await tx.student.findMany({
                where: { id: { in: studentIds } },
                select: {
                    id: true,
                    divisionId: true,
                    User: { select: { name: true } },
                },
            });

            if (students.length !== studentIds.length) {
                throw CreateError(
                    400,
                    "One or more student IDs are invalid",
                    "assignStudentsHandler"
                );
            }

            const unassignedStudents = students.filter(s => s.divisionId === null);
            const unassignedIds = unassignedStudents.map(s => s.id);

            if (unassignedIds.length === 0) {
                throw CreateError(
                    409,
                    "All selected students are already assigned to divisions",
                    "assignStudentsHandler"
                );
            }

            await tx.student.updateMany({
                where: { id: { in: unassignedIds } },
                data: { divisionId },
            });

            return {
                divisionName: division.name,
                count: unassignedIds.length,
                skipped: studentIds.length - unassignedIds.length,
            };
        });

        const message = result.skipped > 0
            ? `Assigned ${result.count} students to division '${result.divisionName}'. Skipped ${result.skipped} already assigned students.`
            : `Assigned ${result.count} students to division '${result.divisionName}'`;

        res.status(200).json({
            result: true,
            message,
        });

    } catch (error: any) {
        console.error("assignStudentsHandler error:", error);

        res.status(error.statusCode || 500).json({
            result: false,
            message: error.message || "Internal server error",
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

        const notInDivision = students.filter((s) => s.divisionId !== divisionId);

        if (notInDivision.length > 0) {
            const names = notInDivision.map((s) => s.User.name).join(", ");
            CreateError(
                409,
                `These students are not in this division: ${names}`,
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
            message: `Removed ${studentIds.length} students from division '${division!.name}' successfully`
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

export const getStudentsOfSemesterHandler = async (req: Request, res: Response) => {

    try {

        const { departmentId, semester: semesterNumber } = req.query;
        if (!departmentId || !semesterNumber) {
            CreateError(400, "departmentId or semester is missing", "get Students Of Semester Handler");
        }

        const department = await prisma.department.findUnique({ where: { id: departmentId as string } });
        if (!department) {
            CreateError(404, "department not found", "get Students Of Semester Handler");
        }

        const sem = await prisma.semester.findFirst({ where: { departmentId: departmentId as string, number: parseInt(semesterNumber as string) } });
        if (!sem) {
            CreateError(404, "Semester not found", "get Students Of Semester Handler");
        }

        const students = await prisma.student.findMany({
            where: { departmentId: departmentId as string, semesterId: sem!.id },
            select: {
                id: true,
                enrollmentNo: true,
                divisionId: true,
                User: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(200).json({
            result: true,
            message: "Fetched students successfully",
            data: { students },
        });

    }

    catch (error: any) {
        console.error("Error in getStudentsOfSemesterHandler:", error);
        res.status(error.statusCode || 500).json({
            result: false,
            message: "Internal server error in get Students Of Semester Handler",
            error
        });
    }

}

export const getStudents = async (req: Request, res: Response) => {
    try {
        const { divisionId } = req.params;
        if (!divisionId) {
            CreateError(400, "Division ID missing", "getStudents Handler");
        }

        const division = await prisma.division.findUnique({ where: { id: divisionId } });
        if (!division) {
            CreateError(404, "Division not found", "remove Students from Division Handler");
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