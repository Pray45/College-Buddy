import { Request, Response } from 'express'
import { CreateError } from '../config/Error'
import {prisma} from '../config/database'
import { EnrollmentStatus } from '@prisma/client'

export const enrollStudentsHandler = async (req: Request, res: Response) => {

    try {

        const { subjectId, studentIds } = (req.body ?? {}) as {
            subjectId: string,
            studentIds: string[]
        }

        if (!subjectId || !studentIds) {
            CreateError(400, "invalid credentials", "assign students to subject");
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            CreateError(404, "subject not found", "assign students to subject");
        }

        const students = await prisma.student.findMany({ where: { id: { in: studentIds } } });
        if (students.length !== studentIds.length) {
            CreateError(400, "One or more student IDs are invalid", "assignStudentsToDivisionHandler");
        }

        const existingEnrollments = await prisma.studentSubject.findMany({
            where: { subjectId, studentId: { in: studentIds } },
            select: { studentId: true },
        });

        const alreadyEnrolledIds = existingEnrollments.map((e) => e.studentId);
        const newStudentIds = studentIds.filter((id) => !alreadyEnrolledIds.includes(id));

        if (newStudentIds.length === 0)
            CreateError(409, "All selected students are already enrolled in this subject", "enrollStudentsHandler");

        await prisma.$transaction(
            newStudentIds.map((studentId) =>
                prisma.studentSubject.create({
                    data: {
                        studentId,
                        subjectId,
                        status: EnrollmentStatus.ACTIVE,
                    },
                })
            )
        );

        res.status(201).json({
            result: true,
            message: `Successfully enrolled ${newStudentIds.length} students in the subject`,
            alreadyEnrolled: alreadyEnrolledIds.length,
        });

    } catch (error) {
        console.error("error in assigning student to subject");
        res.status(500).json({
            result: false,
            message: "INternal server error in assigning student to subject",
            error
        });
    }

}