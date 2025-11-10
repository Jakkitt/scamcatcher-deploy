import { api } from '../utils/api';
const API = import.meta.env.VITE_API_BASE_URL;
const delay = (ms)=>new Promise(r=>setTimeout(r, ms));

export async function login({ email, password }){
  if (import.meta?.env?.VITE_API_BASE_URL) {
    const user = await api.request('/auth/login', { method:'POST', body:{ email, password } });
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  await delay(400);
  if (!email || !password) throw new Error('กรอกข้อมูลไม่ครบ');
  const mock = { email };
  localStorage.setItem('user', JSON.stringify(mock));
  return mock;
}

export async function register({ username, email, password, gender, dob }){
  if (import.meta?.env?.VITE_API_BASE_URL) {
    const user = await api.request('/auth/register', { method:'POST', body:{ username, email, password, gender, dob } });
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  await delay(500);
  if (!email || !password) throw new Error('กรอกข้อมูลไม่ครบ');
  const mock = { username, email, gender, dob };
  localStorage.setItem('user', JSON.stringify(mock));
  return mock;
}

export async function changePassword({ currentPassword, newPassword }) {
  // ถ้ามีแบ็คเอนด์จริง ให้ยิง API
  if (import.meta.env.VITE_API_BASE_URL) {
    return api.request("/auth/change-password", {
      method: "PATCH",
      body: { currentPassword, newPassword },
    });
  }
  // mock (สำหรับตอนนี้)
  await delay(600);
  if (!currentPassword || !newPassword) {
    throw new Error("กรอกข้อมูลไม่ครบ");
  }
  if (currentPassword === newPassword) {
    throw new Error("รหัสผ่านใหม่ต้องต่างจากรหัสผ่านปัจจุบัน");
  }
  return { ok: true };
}

export function logout(){ localStorage.removeItem('user'); }
export function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('user')); }catch{ return null } }
export function updateUser(partial){
  const u = getCurrentUser() || {};
  const merged = { ...u, ...partial };
  localStorage.setItem('user', JSON.stringify(merged));
  return merged;
}
