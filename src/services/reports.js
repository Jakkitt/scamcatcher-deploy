import { request } from '../utils/api';
import { getToken } from './auth';
const delay = (ms)=>new Promise(r=>setTimeout(r, ms));
const KEY = 'reports';

function getAll(){ try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch{ return []; } }
function saveAll(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

export async function createReport(payload){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    await delay(400);
    const list = getAll();
    const id = (list[list.length-1]?.id || 0) + 1;
    const rec = { id, ...payload, createdAt: new Date().toISOString() };
    list.push(rec); saveAll(list);
    return rec;
  }
  const token = getToken();
  return request('/reports', { method:'POST', body: payload, token });
}

export async function searchReports(params){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    await delay(300);
    const { name='', account='', bank='' } = params || {};
    const list = getAll();
    return list.filter(x =>
      (!name || (x.name||'').includes(name)) &&
      (!account || (x.account||'').includes(account)) &&
      (!bank || x.bank === bank)
    );
  }
  const token = getToken();
  const q = new URLSearchParams(params).toString();
  return request(`/reports/search?${q}`, { token });
}

export async function listMyReports(){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    await delay(250);
    return getAll();
  }
  const token = getToken();
  return request('/reports/mine', { token });
}
