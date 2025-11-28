import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/reports.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { csrfProtection } from './middlewares/csrf.js';
import statsRoutes from './routes/stats.routes.js';
import externalRoutes from './routes/external.routes.js';
import { logger } from './utils/logger.js';
import { globalLimiter } from './middlewares/rateLimit.js';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://localhost:4000',
];

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const ORIGINS = [...envOrigins, ...((process.env.NODE_ENV || 'development') === 'development' ? DEV_ORIGINS : [])];
const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';

const app = express();
app.disable('x-powered-by');

export const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowAllOrigins || ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    logger.warn({ origin, allowed: ORIGINS }, 'Blocked by CORS');
    return callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https:", "wss:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "https://www.transparenttextures.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval might be needed for some dev tools or libraries, unsafe-inline for inline scripts
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(
  csrfProtection({
    ignoredPaths: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/logout',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/stats/search', // Allow public stats recording
    ],
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/external', externalRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: { message: 'NOT_FOUND' } });
  }
  return next();
});

app.use((err, req, res, next) => {
  logger.error({ err, path: req.path }, 'Unhandled application error');
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'INTERNAL_SERVER_ERROR' : err.message;
  return res.status(status).json({ error: { message } });
});

export default app;
