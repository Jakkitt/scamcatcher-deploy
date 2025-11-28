import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getSetting } from './settings.js';
import { logger } from '../utils/logger.js';

// Configure Puppeteer Stealth
puppeteer.use(StealthPlugin());

// Updated API Root based on successful tests (Double /api structure)
const API_ROOT =
  process.env.BLACKLISTSELLER_API_URL || 'https://api.blacklistseller.com/api/api/v1/queries';
const DEFAULT_TIMEOUT = Number(process.env.EXTERNAL_REQUEST_TIMEOUT || 30000); // Increased timeout for browser
const API_KEY = process.env.BLACKLISTSELLER_API_KEY || '';
const CACHE_TTL = Number(process.env.EXTERNAL_CACHE_TTL || 5 * 60 * 1000);
const EXTERNAL_SETTING_KEY = 'external_checks_enabled';

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
  // Remove common Thai prefixes
  const prefixes = ['นาย', 'นาง', 'นางสาว', 'น.ส.', 'ด.ช.', 'ด.ญ.', 'พล.ต.อ.', 'พล.ต.ท.', 'พล.ต.ต.', 'พ.ต.อ.', 'พ.ต.ท.', 'พ.ต.ต.', 'ร.ต.อ.', 'ร.ต.ท.', 'ร.ต.ต.'];
  let cleanFirst = first;
  for (const prefix of prefixes) {
    if (cleanFirst.startsWith(prefix)) {
      cleanFirst = cleanFirst.substring(prefix.length).trim();
      break; 
    }
  }
  
  // If firstName contains spaces and lastName is empty, treat firstName as full name
  if (cleanFirst && !last && /\s+/.test(cleanFirst)) {
    const parts = cleanFirst.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      return { 
        first_name: parts.shift(), 
        last_name: parts.join(' ') 
      };
    }
  }

  if (cleanFirst || last) {
    return { first_name: cleanFirst || '-', last_name: last || '-' };
  }
  if (cleanFirst || last) {
    return { first_name: cleanFirst || '-', last_name: last || '-' };
  }

  let cleanName = String(name || '').trim();
  for (const prefix of prefixes) {
    if (cleanName.startsWith(prefix)) {
      cleanName = cleanName.substring(prefix.length).trim();
      break; 
    }
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);
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
      endpoint: 'fullname-detail', // Changed to detail for better results
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

function processExternalResponse(data, url) {
  const rawMatches =
    Array.isArray(data?.data) ? data.data : 
    Array.isArray(data?.result?.data) ? data.result.data : 
    Array.isArray(data?.results) ? data.results : 
    Array.isArray(data) ? data : [];
    
  const matches = normalizeMatches(rawMatches).slice(0, 5);

  return {
    found: matches.length > 0 || (data?.result?.found === true),
    count: matches.length || (data?.count ?? 0),
    matches,
    sourceUrl: url,
    raw: data,
  };
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

  let data;
  const base = API_ROOT.endsWith('/') ? API_ROOT : `${API_ROOT}/`;
  const url = `${base}${requestConfig.endpoint}/`;

  if (process.env.NODE_ENV === 'test') {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify(requestConfig.payload)
      });
      if (res.status !== 200) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      data = await res.json();
    } catch (err) {
      const errorPayload = { found: false, error: err.message };
      cache.set(cacheKey, { payload: errorPayload, timestamp: Date.now() });
      return errorPayload;
    }
  } else {
    let browser = null;
    try {
      // Launch Puppeteer with Stealth
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
        ]
      });

      const page = await browser.newPage();
      
      // Optional: Navigate to main site to establish session/clearance
      try {
        logger.info('Puppeteer: Navigating to main site to get clearance...');
        await page.goto('https://www.blacklistseller.com/', { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        logger.info('Puppeteer: Main site loaded, clearance obtained.');
      } catch (e) {
        logger.warn({ err: e.message }, 'Puppeteer: Failed to fully load main site (timeout or error), proceeding anyway...');
      }

      // Add a small random delay (1-3s) to behave like a human
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

      // Execute fetch inside the browser context
      const result = await page.evaluate(async (apiUrl, apiKey, reqPayload) => {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
              'Referer': 'https://www.blacklistseller.com/',
              'Origin': 'https://www.blacklistseller.com'
            },
            body: JSON.stringify(reqPayload)
          });
          
          const text = await response.text();
          try {
            return { status: response.status, data: JSON.parse(text) };
          } catch {
            return { status: response.status, data: text };
          }
        } catch (err) {
          return { error: err.toString() };
        }
      }, url, API_KEY, requestConfig.payload);

      if (result.error) {
        throw new Error(`Browser Fetch Error: ${result.error}`);
      }

      if (result.status !== 200) {
        logger.warn({ status: result.status, body: result.data, url }, 'BlacklistSeller API error response');
        
        // If still blocked, we might want to return a specific error
        if (result.status === 403) {
           throw new Error('Cloudflare Blocked (403)');
        }
        
        const errorPayload = {
          found: false,
          error: `blacklistseller_status_${result.status}`,
          status: result.status,
          body: result.data,
        };
        cache.set(cacheKey, { payload: errorPayload, timestamp: Date.now() });
        return errorPayload;
      }

      data = result.data;
    } catch (err) {
      logger.error({ err, url: API_ROOT }, 'BlacklistSeller API request failed');
      const timeoutPayload = { 
        found: false, 
        error: err.message || 'blacklistseller_error' 
      };
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey).payload;
      }
      cache.set(cacheKey, { payload: timeoutPayload, timestamp: Date.now() });
      return timeoutPayload;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  const finalResult = processExternalResponse(data, url);
  cache.set(cacheKey, { payload: finalResult, timestamp: Date.now() });
  return finalResult;
}

export function __clearExternalCache() {
  cache.clear();
}
