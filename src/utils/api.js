export function resolveBase(){
  const envBase = import.meta?.env?.VITE_API_BASE_URL;
  if (envBase && String(envBase).trim()) return envBase;
  try{
    const origin = window.location.origin;
    if (origin.includes(':5173')) return 'http://localhost:4000/api';
    return origin + '/api';
  }catch{ return ''; }
}

export function resolveAssetUrl(path = ''){
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = resolveBase();
  if (!base) return path;
  const origin = base.replace(/\/api$/, '');
  if (path.startsWith('/')) return origin + path;
  return `${origin}/uploads/${path}`;
}

function readCookie(name){
  if (typeof document === 'undefined') return '';
  const value = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!value) return '';
  return decodeURIComponent(value.split('=')[1]);
}

function getCsrfToken(){
  return readCookie('sc_csrf');
}

async function performFetch(url, init){
  const res = await fetch(url, init);
  const text = await res.text();
  const data = text ? (()=>{ try{return JSON.parse(text)}catch{return {}} })() : {};
  return { res, data };
}

const SESSION_EVENT = 'sc-session-expired';

function dispatchSessionExpired(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail }));
}

export function onSessionExpired(listener) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SESSION_EVENT, listener);
  return () => window.removeEventListener(SESSION_EVENT, listener);
}

export async function request(path, { method='GET', body, headers={}, credentials='include' } = {}, allowRetry = true){
  const BASE = resolveBase();
  if (!BASE) throw new Error('VITE_API_BASE_URL is not set');
  const isForm = (typeof FormData !== 'undefined') && body instanceof FormData;
  const upperMethod = String(method || 'GET').toUpperCase();
  const requireCsrf = !['GET','HEAD','OPTIONS'].includes(upperMethod);
  const csrfToken = requireCsrf ? getCsrfToken() : '';
  const defaultHeaders = isForm ? {} : { 'Content-Type': 'application/json' };
  const authHeaders = csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  const preparedBody = isForm ? body : (body ? JSON.stringify(body) : undefined);
  const init = {
    method,
    headers: { ...defaultHeaders, ...authHeaders, ...headers },
    credentials,
    body: preparedBody,
  };
  const { res, data } = await performFetch(`${BASE}${path}`, init);
  if (!res.ok) {
    if (res.status === 401 && allowRetry && !path.startsWith('/auth/refresh')) {
      try {
        const refreshResp = await performFetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          credentials,
          headers: { ...authHeaders },
        });
        if (refreshResp.res.ok) {
          return request(path, { method, body, headers, credentials }, false);
        }
        dispatchSessionExpired({ reason: 'refresh_failed' });
        const err = new Error(refreshResp.data?.error?.message || refreshResp.res.statusText);
        err.status = refreshResp.res.status;
        err.data = refreshResp.data;
        throw err;
      } catch (refreshError) {
        dispatchSessionExpired({ reason: 'refresh_failed' });
        throw refreshError;
      }
    } else if (res.status === 401 && !allowRetry) {
      dispatchSessionExpired({ reason: 'unauthorized' });
    }
    const err = new Error(data?.error?.message || data?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = { request };
