import express, { Request, Response } from 'express';
import type { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import { env } from './config/env';
import requestRouter from './routes/request.routes';
import divisionRouter from './routes/division.routes';
import subjectRouter from './routes/subject.routes';

const app: Application = express();
const PORT = env.PORT || '3000';

if (!env.PORT) {
    console.warn("PORT not defined in .env, using default: 3000");
}

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
app.use('/api/requests', requestRouter);
app.use('/api/div', divisionRouter);
app.use('/api/subject', subjectRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Environment: ${env.NODE_ENV}`);
});