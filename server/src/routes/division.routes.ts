import express, { Router } from 'express';
import { assignStudentsHandler, createDivisionHandler, deleteDivisionHandler, getDivisionHandler, getProfessorsByDepartmentHandler, getStudents, getStudentsOfSemesterHandler, removeStudentHandler } from '../controller/division.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { Role } from "../generated/prisma/enums";

const divisionRouter: Router = express.Router();

divisionRouter.post("/create", requireRole(Role.HOD, Role.PROFESSOR), createDivisionHandler);
divisionRouter.get("/get", getDivisionHandler);
divisionRouter.post("/assign", requireRole(Role.HOD, Role.PROFESSOR), assignStudentsHandler);
divisionRouter.delete("/remove", requireRole(Role.HOD, Role.PROFESSOR), removeStudentHandler);
divisionRouter.delete("/delete", requireRole(Role.HOD), deleteDivisionHandler);
divisionRouter.get("/sem/students", getStudentsOfSemesterHandler);
divisionRouter.get("/students/:divisionId", getStudents);
divisionRouter.get("/professors", getProfessorsByDepartmentHandler);

export default divisionRouter