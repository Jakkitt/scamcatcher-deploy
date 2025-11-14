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

export async function request(path, { method='GET', body, token, headers={}, credentials='include' } = {}){
  const BASE = resolveBase();
  if (!BASE) throw new Error('VITE_API_BASE_URL is not set');
  const isForm = (typeof FormData !== 'undefined') && body instanceof FormData;
  const init = {
    method,
    headers: isForm ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }
                    : { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    credentials,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  };
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  const data = text ? (()=>{ try{return JSON.parse(text)}catch{return {}} })() : {};
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = { request };
