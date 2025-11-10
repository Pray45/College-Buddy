import express, { Router } from 'express';
import { enrollStudentsHandler } from '../controller/studentSubject.controller';

const studentSubjectRouter : Router = express.Router();

studentSubjectRouter.post('/create', enrollStudentsHandler);

export default studentSubjectRouter