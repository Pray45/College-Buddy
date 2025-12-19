import express, { Router } from 'express';
import { assignTeacherHandler, getAssignedHandler, deleteAssignedHanlder } from '../controller/subjectAssign.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from '@prisma/client';

const assignRoutrer: Router = express.Router();

assignRoutrer.post('/create',  assignTeacherHandler);
assignRoutrer.get('/get/div', getAssignedHandler)
assignRoutrer.delete('/delete', requireRole(Role.HOD, Role.PROFESSOR), deleteAssignedHanlder);

export default assignRoutrer