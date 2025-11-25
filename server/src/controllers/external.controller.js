import { queryBlacklistSeller } from '../services/externalChecks.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getExternalChecks = asyncHandler(async (req, res) => {
  try {
    const { firstName = '', lastName = '', name = '', account = '', bank = '', channel = '' } = req.query || {};
    const blacklistseller = await queryBlacklistSeller({ firstName, lastName, name, account, bank, channel });
    return res.json({
      checkedAt: new Date().toISOString(),
      sources: {
        blacklistseller,
      },
      meta: {
        query: { firstName, lastName, name, account, bank, channel },
      },
    });
  } catch (err) {
    logger.error({ err, scope: 'external-checks' }, 'External check failed');
    // We return a specific error message for external checks as per original logic
    return res.status(500).json({ error: { message: 'EXTERNAL_CHECK_FAILED' } });
  }
});
