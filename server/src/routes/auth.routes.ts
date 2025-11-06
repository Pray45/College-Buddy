import express from 'express';
import type { Router } from 'express';
import { getUserHandler, loginHandler, refreashTokenHandler, RegistrationHandler } from '../controller/auth.controller';
import validate from '../middleware/zod.middleware';
import { loginSchema, registerSchema } from '../validation/User.schema';

const authRouter: Router = express.Router();

authRouter.post('/register', validate(registerSchema), RegistrationHandler);
authRouter.post('/login', validate(loginSchema), loginHandler);
authRouter.post('/refresh', refreashTokenHandler);
authRouter.post('/get', getUserHandler);

export default authRouter;