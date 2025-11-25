import { normalizePayload, readStats, recordStats, shouldSkip } from '../services/stats.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

export const recordSearchStats = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body || {});
  if (shouldSkip(payload)) {
    return res.json(buildResponse({}));
  }

  const stats = await recordStats(payload);

  return res.json(buildResponse(stats));
});

export const getSearchStats = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.query || {});
  if (shouldSkip(payload)) {
    return res.json(buildResponse({}));
  }

  const stats = await readStats(payload);

  return res.json(buildResponse(stats));
});
