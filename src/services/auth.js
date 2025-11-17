import { request } from '../utils/api';
const delay = (ms)=>new Promise(r=>setTimeout(r, ms));
// ปิดโหมด mock เรียกใช้งานจริงเท่านั้น
const ENABLE_MOCK = false;

export async function login({ email, password }){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    if (!ENABLE_MOCK) throw new Error('VITE_API_BASE_URL is not set');
    await delay(400);
    if (!email || !password) throw new Error('กรอกข้อมูลไม่ครบ');
    const isAdmin = String(email).toLowerCase().startsWith('admin');
    const mock = { user:{ email, role: isAdmin ? 'admin' : 'user' } };
    saveAuth(mock);
    return mock.user;
  }
  const res = await request('/auth/login', { method:'POST', body:{ email, password } });
  saveAuth(res);
  return res.user;
}

export async function register({ username, email, password, gender, dob }){
  if (!import.meta?.env?.VITE_API_BASE_URL) {
    if (!ENABLE_MOCK) throw new Error('VITE_API_BASE_URL is not set');
    await delay(500);
    if (!email || !password) throw new Error('กรอกข้อมูลไม่ครบ');
    const isAdmin = String(email).toLowerCase().startsWith('admin');
    const mock = { user:{ username, email, gender, dob, role: isAdmin ? 'admin' : 'user' } };
    saveAuth(mock);
    return mock.user;
  }
  const res = await request('/auth/register', { method:'POST', body:{ username, email, password, gender, dob } });
  saveAuth(res);
  return res.user;
}

export async function changePassword({ currentPassword, newPassword }) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    if (!ENABLE_MOCK) throw new Error('VITE_API_BASE_URL is not set');
    await delay(600);
    if (!currentPassword || !newPassword) throw new Error('กรอกข้อมูลไม่ครบ');
    if (currentPassword === newPassword) throw new Error('รหัสผ่านใหม่ต้องต่างจากรหัสผ่านปัจจุบัน');
    return { ok:true };
  }
  return request('/auth/change-password', { method:'POST', body:{ currentPassword, newPassword } });
}

export async function logout(){
  if (!import.meta?.env?.VITE_API_BASE_URL){
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    return;
  }
  try{
    await request('/auth/logout', { method:'POST' });
  }catch(err){
    console.warn('logout failed, clearing session locally', err);
  }finally{
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  }
}
export function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('user')); }catch{ return null } }
export function updateUser(partial){
  // ถ้าไม่มี backend ให้ทำแบบ local mock เดิม
  if (!import.meta?.env?.VITE_API_BASE_URL){
    const u = getCurrentUser() || {};
    const merged = { ...u, ...partial };
    localStorage.setItem('user', JSON.stringify(merged));
    return merged;
  }
  // มี backend: อัปเดตผ่าน API แล้ว sync localStorage
  return request('/auth/profile', { method:'PATCH', body: partial })
    .then(res => {
      if (res?.user){ localStorage.setItem('user', JSON.stringify(res.user)); return res.user; }
      return getCurrentUser();
    });
}

export async function deleteAccount({ email }){
  if (!import.meta?.env?.VITE_API_BASE_URL){
    await delay(300);
    logout();
    return { ok:true };
  }
  return request('/auth/account', { method:'DELETE', body:{ email } });
}

function saveAuth(res){
  localStorage.setItem('user', JSON.stringify(res.user));
  localStorage.removeItem('tokens');
}
