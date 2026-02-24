import express from 'express'
import { createSubjectHandler, deleteSubjectHanlder, getAllSubjectsHandler, getFilterOptionsHandler, getSubjectByDeoartrmentHandler, getSubjectDetailsHandler, getSubjectHandler } from '../controller/subject.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from "../generated/prisma/enums";

const subjectRouter = express.Router();

subjectRouter.post('/create', requireRole(Role.HOD, Role.PROFESSOR), createSubjectHandler);
subjectRouter.get('/all', getAllSubjectsHandler);
subjectRouter.get('/get/sem', getSubjectHandler);
subjectRouter.get('/get/dept', getSubjectByDeoartrmentHandler);
subjectRouter.get('/filters', getFilterOptionsHandler);
subjectRouter.get('/details/:subjectId', getSubjectDetailsHandler);
subjectRouter.delete('/delete', requireRole(Role.HOD, Role.PROFESSOR), deleteSubjectHanlder);

export default subjectRouter;