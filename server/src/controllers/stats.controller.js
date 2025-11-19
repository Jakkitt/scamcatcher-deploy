import { normalizePayload, readStats, recordStats, shouldSkip } from '../services/stats.js';

const buildResponse = ({
  queryCount = 0,
  nameCount = 0,
  accountCount = 0,
  channelCount = 0,
  bankCount = 0,
  firstNameCount = 0,
  lastNameCount = 0,
}) => ({
  queryCount,
  nameCount,
  accountCount,
  channelCount,
  bankCount,
  firstNameCount,
  lastNameCount,
});

export async function recordSearchStats(req, res) {
  try {
    const payload = normalizePayload(req.body || {});
    if (shouldSkip(payload)) {
      return res.json(buildResponse({}));
    }

    const stats = await recordStats(payload);

    return res.json(buildResponse(stats));
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}

export async function getSearchStats(req, res) {
  try {
    const payload = normalizePayload(req.query || {});
    if (shouldSkip(payload)) {
      return res.json(buildResponse({}));
    }

    const stats = await readStats(payload);

    return res.json(buildResponse(stats));
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
