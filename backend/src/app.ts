import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from './config/passport';
import routes from './routes/index.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport (Sessionless JWT usage)
app.use(passport.initialize());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
