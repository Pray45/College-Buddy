import express from 'express'
import { createSubjectHandler, deleteSubjectHanlder, getSubjectByDeoartrmentHandler, getSubjectHandler } from '../controller/subject.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from "../generated/prisma/enums";

const subjectRouter = express.Router();

subjectRouter.post('/create', requireRole(Role.HOD, Role.PROFESSOR), createSubjectHandler);
subjectRouter.get('/get/sem', getSubjectHandler);
subjectRouter.get('/get/dept', getSubjectByDeoartrmentHandler);
subjectRouter.delete('/delete', requireRole(Role.HOD, Role.PROFESSOR), deleteSubjectHanlder);

export default subjectRouter;