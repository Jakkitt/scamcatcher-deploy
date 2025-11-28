import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { ORIGINS, corsOptions } from './app.js';
import cors from 'cors';
import { createPurgeOrphansJob } from './jobs/purgeOrphans.job.js';
import portfinder from 'portfinder';
import { logger } from './utils/logger.js';
import { validateEnv } from './utils/validateEnv.js';

// CRITICAL: Validate environment variables before startup
validateEnv();

const {
  PORT = 4000,
  MONGODB_URI,
  USE_MEMORY_DB = 'false',
  NODE_ENV = 'development',
  MEMORY_DB_FALLBACK = process.env.NODE_ENV === 'production' ? 'false' : 'true',
  TRUST_PROXY = '1',
} = process.env;

let memoryServer;
let server;

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
    if (process.env.NODE_ENV === 'production') {
      logger.error('MongoDB connection failed in Production. Exiting...');
      process.exit(1);
    }
    logger.warn({ err }, 'Primary MongoDB connection failed. Falling back to in-memory instance.');
    const fallbackUri = await startMemoryServer('fallback');
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
    logger.info({ mongoUri: fallbackUri }, '[MongoDB] connected (fallback)');
  }
}

async function resolvePort(requestedPort) {
  const basePort = Number(requestedPort) || 4000;
  portfinder.basePort = basePort;

  try {
    const availablePort = await portfinder.getPortPromise({ port: basePort });
    if (availablePort !== basePort) {
      logger.warn(
        { requestedPort: basePort, port: availablePort },
        'Requested port is busy. Falling back to an available port.',
      );
    }
    return availablePort;
  } catch (err) {
    logger.error({ err, requestedPort: basePort }, 'Failed to resolve an available port');
    throw err;
  }
}

async function shutdown() {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
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
    
    // Use centralized CORS options for uploads
    app.use('/uploads', cors(corsOptions), (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
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

    // Force 4000 if PORT is 4011 (legacy default)
    const targetPort = PORT === '4011' ? 4000 : PORT;
    const port = await resolvePort(targetPort);
    server = app.listen(port, () => {
      logger.info({ port, env: NODE_ENV, origins: ORIGINS }, `[API] http://localhost:${port}`);
    });
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
