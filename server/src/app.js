import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/reports.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { csrfProtection } from './middlewares/csrf.js';

export const ORIGINS = ['http://localhost:5173'];

const app = express();

app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(
  csrfProtection({
    ignoredPaths: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/logout',
    ],
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

export default app;
