import express from 'express'
import { createSubjectHandler, getSubjectHandler } from '../controller/subject.controller';

const subjectRouter = express.Router();

subjectRouter.post('/create', createSubjectHandler);
subjectRouter.get('/get', getSubjectHandler);

export default subjectRouter