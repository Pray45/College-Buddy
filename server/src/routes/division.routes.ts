import express, { Router } from 'express';
import { assignStudentsHandler, createDivisionHandler, getDivisionHandler, getStudents, removeStudentHandler } from '../controller/division.controller';

const divisionRouter: Router = express.Router();

divisionRouter.post("/create", createDivisionHandler);
divisionRouter.get("/get", getDivisionHandler);
divisionRouter.post("/assign", assignStudentsHandler);
divisionRouter.delete("/remove", removeStudentHandler)
divisionRouter.get("/students", getStudents);

export default divisionRouter