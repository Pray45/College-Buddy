import express from 'express';
import type { Router } from 'express';
import { LoginHandler, RegisterHandler, RefreshTokenHandler } from '../controller/auth.controller';
import { loginSchema, registerSchema } from '../validation/User.schema';
import validate from '../middleware/zod.middleware';

const authRouter: Router = express.Router();

// Use POST for login and register
authRouter.post('/login', validate(loginSchema), LoginHandler);
authRouter.post('/register', validate(registerSchema), RegisterHandler);
authRouter.post('/refresh', RefreshTokenHandler);

export default authRouter;