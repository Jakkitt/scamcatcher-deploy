import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/reports.routes.js';

const app = express();

const ORIGINS = [
  'http://localhost:5173',
];

app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// db + server
const { PORT = 4000, MONGODB_URI } = process.env;

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('[MongoDB] connected');
    // Serve frontend build (if exists)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(__dirname, '../../dist');
    const uploadsPath = path.resolve(__dirname, '../../uploads');
    app.use('/uploads', express.static(uploadsPath));
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(PORT, () => console.log(`[API] http://localhost:${PORT}`));
  } catch (err) {
    console.error('[MongoDB] error:', err.message);
    process.exit(1);
  }
})();
