import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { ORIGINS } from './app.js';

const { PORT = 4000, MONGODB_URI } = process.env;

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('[MongoDB] connected');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(__dirname, '../../dist');
    const uploadsPath = path.resolve(__dirname, '../uploads');
    app.use('/uploads', (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const origin = req.get('Origin');
      if (origin && ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    }, express.static(uploadsPath));
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

