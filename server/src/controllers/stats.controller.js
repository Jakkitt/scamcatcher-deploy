import SearchStat from '../models/SearchStat.js';

const TYPES = {
  QUERY: 'query',
  NAME: 'name',
  ACCOUNT: 'account',
  CHANNEL: 'channel',
};

const normalizeName = (value = '') => value.trim().toLowerCase();
const normalizeAccount = (value = '') => value.replace(/[^\d]/g, '');
const normalizeChannel = (value = '') => value.trim().toLowerCase();
const normalizeBank = (value = '') => value.trim().toLowerCase();

const buildQueryKey = ({ name = '', account = '', bank = '', channel = '' }) =>
  ['name', name || '-', 'account', account || '-', 'bank', bank || '-', 'channel', channel || '-'].join('|');

async function incrementStat(type, key) {
  if (!key) return 0;
  const stat = await SearchStat.findOneAndUpdate(
    { type, key },
    { $inc: { count: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return stat?.count || 0;
}

async function readStat(type, key) {
  if (!key) return 0;
  const stat = await SearchStat.findOne({ type, key });
  return stat?.count || 0;
}

function sanitizePayload(payload = {}) {
  const name = normalizeName(payload.name || '');
  const account = normalizeAccount(payload.account || '');
  const bank = normalizeBank(payload.bank || '');
  const channel = normalizeChannel(payload.channel || '');
  return { name, account, bank, channel };
}

function buildResponse({ queryCount = 0, nameCount = 0, accountCount = 0, channelCount = 0 }) {
  return {
    queryCount,
    nameCount,
    accountCount,
    channelCount,
  };
}

export async function recordSearchStats(req, res) {
  try {
    const payload = sanitizePayload(req.body || {});
    if (!payload.name && !payload.account && !payload.bank && !payload.channel) {
      return res.json(buildResponse({}));
    }

    const queryKey = buildQueryKey(payload);
    const [queryCount, nameCount, accountCount, channelCount] = await Promise.all([
      incrementStat(TYPES.QUERY, queryKey),
      payload.name ? incrementStat(TYPES.NAME, payload.name) : Promise.resolve(0),
      payload.account ? incrementStat(TYPES.ACCOUNT, payload.account) : Promise.resolve(0),
      payload.channel ? incrementStat(TYPES.CHANNEL, payload.channel) : Promise.resolve(0),
    ]);

    return res.json(buildResponse({ queryCount, nameCount, accountCount, channelCount }));
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}

export async function getSearchStats(req, res) {
  try {
    const payload = sanitizePayload(req.query || {});
    if (!payload.name && !payload.account && !payload.bank && !payload.channel) {
      return res.json(buildResponse({}));
    }

    const queryKey = buildQueryKey(payload);
    const [queryCount, nameCount, accountCount, channelCount] = await Promise.all([
      readStat(TYPES.QUERY, queryKey),
      payload.name ? readStat(TYPES.NAME, payload.name) : Promise.resolve(0),
      payload.account ? readStat(TYPES.ACCOUNT, payload.account) : Promise.resolve(0),
      payload.channel ? readStat(TYPES.CHANNEL, payload.channel) : Promise.resolve(0),
    ]);

    return res.json(buildResponse({ queryCount, nameCount, accountCount, channelCount }));
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
