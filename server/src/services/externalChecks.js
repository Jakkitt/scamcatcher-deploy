import { getSetting } from './settings.js';

const API_ROOT =
  process.env.BLACKLISTSELLER_API_URL || 'https://api.blacklistseller.com/api/api/v1/queries';
const DEFAULT_TIMEOUT = Number(process.env.EXTERNAL_REQUEST_TIMEOUT || 8000);
const API_KEY = process.env.BLACKLISTSELLER_API_KEY || '';
const CACHE_TTL = Number(process.env.EXTERNAL_CACHE_TTL || 5 * 60 * 1000);
const EXTERNAL_SETTING_KEY = 'external_checks_enabled';

const fetchFn = (...args) => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch API is not available in this runtime. Please upgrade to Node 18+ or provide a polyfill.');
  }
  return fetch(...args);
};

const cache = new Map();

const buildCacheKey = ({ endpoint = '', payload = {} }) =>
  [endpoint, JSON.stringify(payload)]
    .map((val) => String(val || '').trim().toLowerCase())
    .join('|');

function normalizeMatches(entries = []) {
  return entries
    .filter(Boolean)
    .map((entry = {}) => {
      const account =
        entry.account ||
        entry.account_no ||
        entry.accountNumber ||
        entry.accountNumberNoDash ||
        entry.bank_account ||
        entry.acc_no ||
        entry.no;
      const bank = entry.bank || entry.bank_name || entry.bankName || entry.account_bank;
      const name = entry.name || entry.account_name || entry.owner || entry.fullname || entry.accountOwner;
      const url =
        entry.url ||
        entry.link ||
        entry.reference ||
        (entry.slug ? `https://www.blacklistseller.com/report/${entry.slug}` : undefined);
      const description = entry.detail || entry.description || entry.case_detail || entry.note || '';
      return {
        id: entry.id || entry._id || entry.case_id || entry.reference_id || account || name || undefined,
        name: name || '',
        bank: bank || '',
        account: account || '',
        description,
        url,
      };
    });
}

function buildNamePayload({ firstName = '', lastName = '', name = '' }) {
  const first = String(firstName || '').trim();
  const last = String(lastName || '').trim();
  if (first || last) {
    return { first_name: first || '-', last_name: last || '-' };
  }
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return null;
  const resolvedFirst = parts.shift();
  const resolvedLast = parts.length ? parts.join(' ') : '-';
  return { first_name: resolvedFirst, last_name: resolvedLast };
}

function resolveRequestPayload({ firstName = '', lastName = '', name = '', account = '' }) {
  const normalizedAccount = String(account || '').replace(/[^\d]/g, '');
  const namePayload = buildNamePayload({ firstName, lastName, name });
  if (namePayload) {
    return {
      endpoint: 'fullname-summary',
      payload: namePayload,
    };
  }
  if (normalizedAccount) {
    return {
      endpoint: 'bank-summary',
      payload: { bank_number: normalizedAccount },
    };
  }
  return null;
}

async function safeParseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function queryBlacklistSeller({ firstName = '', lastName = '', name = '', account = '', bank = '' }) {
  if (!API_KEY) {
    return {
      found: false,
      skipped: true,
      reason: 'missing_api_key',
    };
  }

  const enabled = await getSetting(EXTERNAL_SETTING_KEY, true);
  if (!enabled) {
    return { found: false, skipped: true, reason: 'disabled' };
  }

  const requestConfig = resolveRequestPayload({ firstName, lastName, name, account });
  if (!requestConfig) {
    return {
      found: false,
      skipped: true,
      reason: 'missing_query',
    };
  }

  const cacheKey = buildCacheKey(requestConfig);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.payload, cached: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const base = API_ROOT.endsWith('/') ? API_ROOT : `${API_ROOT}/`;
    const url = `${base}${requestConfig.endpoint}/`;
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(requestConfig.payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text();
      const errorPayload = {
        found: false,
        error: `blacklistseller_status_${res.status}`,
        status: res.status,
        body: body?.slice(0, 1000),
      };
      if (cached) {
        cache.set(cacheKey, { payload: cached.payload, timestamp: cached.timestamp });
        return cached.payload;
      }
      cache.set(cacheKey, { payload: errorPayload, timestamp: Date.now() });
      return errorPayload;
    }

    const data = await safeParseJson(res);
    const rawMatches =
      Array.isArray(data?.data) ? data.data : Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    const matches = normalizeMatches(rawMatches).slice(0, 5);

    const result = {
      found: matches.length > 0 || Boolean(data),
      count: matches.length || (data?.count ?? 0),
      matches,
      sourceUrl: url,
      raw: data,
    };
    cache.set(cacheKey, { payload: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    const timeoutPayload =
      err.name === 'AbortError'
        ? { found: false, error: 'blacklistseller_timeout' }
        : { found: false, error: err.message || 'blacklistseller_error' };
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey).payload;
    }
    cache.set(cacheKey, { payload: timeoutPayload, timestamp: Date.now() });
    return timeoutPayload;
  }
}

export function __clearExternalCache() {
  cache.clear();
}
