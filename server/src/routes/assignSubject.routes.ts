import express, { Router } from 'express';
import { assignTeacherHandler, getAssignedHandler, deleteAssignedHanlder } from '../controller/subjectAssign.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from "../generated/prisma/enums";

const assignRoutrer: Router = express.Router();

assignRoutrer.post('/create', requireRole(Role.HOD), assignTeacherHandler);
assignRoutrer.get('/get/div', getAssignedHandler)
assignRoutrer.delete('/delete', requireRole(Role.HOD), deleteAssignedHanlder);

export default assignRoutrer