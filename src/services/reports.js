import { request } from '../utils/api';
import { getToken, getCurrentUser } from './auth';
const delay = (ms)=>new Promise(r=>setTimeout(r, ms));
const KEY = 'reports';

function getAll(){ try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch{ return []; } }
function saveAll(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

export async function createReport(payload){
  const token = getToken();
  try {
    return await request('/reports', { method:'POST', body: payload, token });
  } catch {
    // Fallback mock (offline/local) — ผูกกับผู้ใช้ปัจจุบันเสมอเพื่อไม่ให้ข้ามบัญชี
    await delay(200);
    const list = getAll();
    const id = (list[list.length-1]?.id || 0) + 1;
    const owner = getCurrentUser()?.id || getCurrentUser()?._id || 'local';
    const rec = { id, owner, ...payload, createdAt: new Date().toISOString(), status: 'pending' };
    list.push(rec); saveAll(list);
    return rec;
  }
}

export async function searchReports(params){
  const token = getToken();
  const q = new URLSearchParams(params).toString();
  try{
    return await request(`/reports/search?${q}`, { token });
  }catch{
    await delay(150);
    const { name='', account='', bank='' } = params || {};
    const list = getAll();
    return list.filter(x =>
      (!name || (x.name||'').toLowerCase().includes(String(name).toLowerCase())) &&
      (!account || (x.account||'').includes(account)) &&
      (!bank || x.bank === bank)
    );
  }
}

export async function listMyReports(){
  const token = getToken();
  try{
    return await request('/reports/mine', { token });
  }catch{
    await delay(120);
    const me = getCurrentUser();
    const uid = me?.id || me?._id || 'local';
    return getAll().filter(x => String(x.owner) === String(uid) || String(x.ownerId) === String(uid));
  }
}

export async function removeReport(id){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    await delay(150);
    const list = getAll().filter(x => String(x.id) !== String(id));
    saveAll(list);
    return { ok:true };
  }
  const token = getToken();
  return request(`/reports/${id}`, { method:'DELETE', token });
}

// Admin services
export async function adminListReports(){
  const token = getToken();
  return request('/reports/admin/all', { token });
}

export async function approveReport(id){
  const token = getToken();
  return request(`/reports/${id}/approve`, { method:'PATCH', token });
}

export async function rejectReport(id){
  const token = getToken();
  return request(`/reports/${id}/reject`, { method:'PATCH', token });
}

export async function resetReportStatus(id){
  const token = getToken();
  return request(`/reports/${id}/pending`, { method:'PATCH', token });
}

export async function purgeOrphans(){
  const token = getToken();
  return request('/reports/_orphans/purge', { method:'DELETE', token });
}

export async function countOrphans(){
  const token = getToken();
  return request('/reports/_orphans/count', { token });
}
