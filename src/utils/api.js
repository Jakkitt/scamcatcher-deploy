const BASE = import.meta?.env?.VITE_API_BASE_URL || '';

export async function request(path, { method='GET', body, token, headers={}, credentials='include' } = {}){
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
  if (!res.ok) throw new Error(data?.error?.message || data?.message || res.statusText);
  return data;
}

export const api = { request };
