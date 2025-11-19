import SearchStat from '../models/SearchStat.js';

const TYPES = {
  QUERY: 'query',
  NAME: 'name',
  ACCOUNT: 'account',
  CHANNEL: 'channel',
  BANK: 'bank',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
};

const normalizeNamePart = (value = '') => value.trim().toLowerCase();
const normalizeAccount = (value = '') => value.replace(/[^\d]/g, '');
const normalizeChannel = (value = '') => value.trim().toLowerCase();
const normalizeBank = (value = '') => value.trim().toLowerCase();

const buildFullName = ({ firstName = '', lastName = '', name = '' }) => {
  const parts = [firstName, lastName].map((val) => normalizeNamePart(val || ''));
  const combined = parts.filter(Boolean).join(' ').trim();
  return combined || normalizeNamePart(name || '');
};

const buildQueryKey = ({ firstName = '', lastName = '', account = '', bank = '', channel = '' }) =>
  [
    'first',
    firstName || '-',
    'last',
    lastName || '-',
    'account',
    account || '-',
    'bank',
    bank || '-',
    'channel',
    channel || '-',
  ].join('|');

async function incrementStat(type, key) {
  if (!key) return 0;
  const stat = await SearchStat.findOneAndUpdate(
    { type, key },
    { $inc: { count: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return stat?.count || 0;
}

async function readStat(type, key) {
  if (!key) return 0;
  const stat = await SearchStat.findOne({ type, key });
  return stat?.count || 0;
}

export function normalizePayload(payload = {}) {
  const firstName = normalizeNamePart(payload.firstName || '');
  const lastName = normalizeNamePart(payload.lastName || '');
  const name = buildFullName({ firstName, lastName, name: payload.name || '' });
  const account = normalizeAccount(payload.account || '');
  const bank = normalizeBank(payload.bank || '');
  const channel = normalizeChannel(payload.channel || '');
  return { firstName, lastName, name, account, bank, channel };
}

export function shouldSkip(payload = {}) {
  return !payload.name && !payload.account && !payload.bank && !payload.channel;
}

export async function recordStats(payload) {
  const queryKey = buildQueryKey(payload);
  const [queryCount, nameCount, accountCount, channelCount, bankCount, firstNameCount, lastNameCount] =
    await Promise.all([
      incrementStat(TYPES.QUERY, queryKey),
      payload.name ? incrementStat(TYPES.NAME, payload.name) : 0,
      payload.account ? incrementStat(TYPES.ACCOUNT, payload.account) : 0,
      payload.channel ? incrementStat(TYPES.CHANNEL, payload.channel) : 0,
      payload.bank ? incrementStat(TYPES.BANK, payload.bank) : 0,
      payload.firstName ? incrementStat(TYPES.FIRST_NAME, payload.firstName) : 0,
      payload.lastName ? incrementStat(TYPES.LAST_NAME, payload.lastName) : 0,
    ]);
  return { queryCount, nameCount, accountCount, channelCount, bankCount, firstNameCount, lastNameCount };
}

export async function readStats(payload) {
  const queryKey = buildQueryKey(payload);
  const [queryCount, nameCount, accountCount, channelCount, bankCount, firstNameCount, lastNameCount] =
    await Promise.all([
      readStat(TYPES.QUERY, queryKey),
      payload.name ? readStat(TYPES.NAME, payload.name) : 0,
      payload.account ? readStat(TYPES.ACCOUNT, payload.account) : 0,
      payload.channel ? readStat(TYPES.CHANNEL, payload.channel) : 0,
      payload.bank ? readStat(TYPES.BANK, payload.bank) : 0,
      payload.firstName ? readStat(TYPES.FIRST_NAME, payload.firstName) : 0,
      payload.lastName ? readStat(TYPES.LAST_NAME, payload.lastName) : 0,
    ]);
  return { queryCount, nameCount, accountCount, channelCount, bankCount, firstNameCount, lastNameCount };
}
