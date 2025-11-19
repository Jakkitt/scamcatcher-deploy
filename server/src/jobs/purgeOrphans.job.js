import cron from 'node-cron';
import { purgeOrphanReports } from '../services/reportMaintenance.js';
import { logger } from '../utils/logger.js';

export function createPurgeOrphansJob() {
  const schedule = process.env.PURGE_ORPHANS_CRON || '0 3 * * *';
  const task = cron.schedule(
    schedule,
    async () => {
      try {
        const result = await purgeOrphanReports();
        logger.info(
          { ...result, job: 'purge-orphans' },
          `Purged ${result.deleted} orphan reports`,
        );
      } catch (err) {
        logger.error({ err, job: 'purge-orphans' }, 'Failed to purge orphan reports');
      }
    },
    { scheduled: false, timezone: process.env.TZ || 'Asia/Bangkok' },
  );
  return task;
}
