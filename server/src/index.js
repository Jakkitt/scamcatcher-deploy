import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { ORIGINS } from './app.js';
import { createPurgeOrphansJob } from './jobs/purgeOrphans.job.js';
import { logger } from './utils/logger.js';

const {
  PORT = 4000,
  MONGODB_URI,
  USE_MEMORY_DB = 'false',
  NODE_ENV = 'development',
  MEMORY_DB_FALLBACK = 'true',
  TRUST_PROXY = '1',
} = process.env;

let memoryServer;

if (TRUST_PROXY && TRUST_PROXY !== 'false') {
  const proxyValue = TRUST_PROXY === 'true' ? 1 : Number(TRUST_PROXY);
  const normalizedValue = Number.isNaN(proxyValue) ? 1 : proxyValue;
  app.set('trust proxy', normalizedValue);
  logger.info({ trustProxy: normalizedValue }, 'trust proxy enabled');
}

async function startMemoryServer(reason = 'manual') {
  if (memoryServer) return memoryServer.getUri();
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  logger.warn(
    { uri: memoryServer.getUri(), reason },
    'Using in-memory MongoDB instance (set USE_MEMORY_DB=false and MEMORY_DB_FALLBACK=false to disable)',
  );
  return memoryServer.getUri();
}

async function resolveMongoUri() {
  const shouldUseMemory = USE_MEMORY_DB === 'true' || (!MONGODB_URI && NODE_ENV !== 'production');
  if (shouldUseMemory) {
    const reason = USE_MEMORY_DB === 'true' ? 'forced' : 'missing_uri';
    return startMemoryServer(reason);
  }
  if (!MONGODB_URI) {
    logger.error(
      'MONGODB_URI is not defined. Set it in server/.env or enable USE_MEMORY_DB=true for an in-memory instance.',
    );
    process.exit(1);
  }
  return MONGODB_URI;
}

async function connectMongo(uri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    logger.info({ mongoUri: uri }, '[MongoDB] connected');
  } catch (err) {
    if (memoryServer || MEMORY_DB_FALLBACK === 'false') {
      throw err;
    }
    logger.warn({ err }, 'Primary MongoDB connection failed. Falling back to in-memory instance.');
    const fallbackUri = await startMemoryServer('fallback');
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
    logger.info({ mongoUri: fallbackUri }, '[MongoDB] connected (fallback)');
  }
}

async function shutdown() {
  try {
    await mongoose.disconnect();
  } catch (err) {
    logger.warn({ err }, 'Error while disconnecting mongoose');
  }
  if (memoryServer) {
    try {
      await memoryServer.stop();
    } catch (err) {
      logger.warn({ err }, 'Failed to stop in-memory MongoDB');
    }
  }
  process.exit(0);
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown());
});

(async () => {
  try {
    const mongoUri = await resolveMongoUri();
    await connectMongo(mongoUri);
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

    const purgeJob = createPurgeOrphansJob();
    purgeJob.start();
    logger.info({ job: 'purge-orphans', schedule: process.env.PURGE_ORPHANS_CRON || '0 3 * * *' }, 'Scheduled purge job');

    app.listen(PORT, () => logger.info({ port: PORT }, `[API] http://localhost:${PORT}`));
  } catch (err) {
    logger.error({ err }, '[MongoDB] error');
    if (memoryServer) {
      try {
        await memoryServer.stop();
      } catch (stopErr) {
        logger.warn({ err: stopErr }, 'Failed to stop in-memory MongoDB after error');
      }
    }
    process.exit(1);
  }
})();
