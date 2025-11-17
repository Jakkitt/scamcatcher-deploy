import { queryBlacklistSeller } from '../services/externalChecks.js';

export async function getExternalChecks(req, res) {
  try {
    const { name = '', account = '', bank = '' } = req.query || {};
    const blacklistseller = await queryBlacklistSeller({ name, account, bank });
    return res.json({
      checkedAt: new Date().toISOString(),
      sources: {
        blacklistseller,
      },
    });
  } catch (err) {
    console.error('[external-checks]', err);
    return res.status(500).json({ error: { message: 'EXTERNAL_CHECK_FAILED' } });
  }
}
