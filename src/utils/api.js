const BASE = import.meta?.env?.VITE_API_BASE_URL || '';

export const api = {
  async request(
    path,
    { method = 'GET', headers = {}, body, token, credentials = 'include' } = {}
  ) {
    if (!BASE) throw new Error('VITE_API_BASE_URL is not set');
    const init = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      credentials,
    };
    if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, init);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || res.statusText || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },
};
