import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import { env } from './config/env';


const app: Application = express();
const PORT: number = parseInt(env.PORT!);

if (PORT == null || isNaN(PORT)) console.error("PORT is not defined in .env file");

app.use(cors(
    {
        origin: env.NODE_ENV === 'development' ? '*' : env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});