import express, { Router } from 'express';
import { enrollStudentsHandler, getStudentSubjectsHandler } from '../controller/studentSubject.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from '../generated/prisma/enums';

const studentSubjectRouter : Router = express.Router();

studentSubjectRouter.get('/my-subjects/:enrollmentNo', getStudentSubjectsHandler);
studentSubjectRouter.post('/create', requireRole(Role.HOD), enrollStudentsHandler);

export default studentSubjectRouter