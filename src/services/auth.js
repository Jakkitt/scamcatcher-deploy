import { request } from '../utils/api';
const delay = (ms)=>new Promise(r=>setTimeout(r, ms));
// ปิดโหมด mock เรียกใช้งานจริงเท่านั้น
const ENABLE_MOCK = false;

export async function login({ email, password }){
  const res = await request('/auth/login', { method:'POST', body:{ email, password } });
  saveAuth(res);
  return res.user;
}

export async function register({ username, email, password, gender, dob }){
  const res = await request('/auth/register', { method:'POST', body:{ username, email, password, gender, dob } });
  saveAuth(res);
  return res.user;
}

export async function changePassword({ currentPassword, newPassword, pin }) {
  return request('/auth/change-password', { method:'POST', body:{ currentPassword, newPassword, pin } });
}

export async function requestPasswordReset({ email }) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } });
}

export async function resetPassword({ token, newPassword }) {
  return request('/auth/reset-password', { method: 'POST', body: { token, newPassword } });
}

export async function requestChangePasswordPin() {
  return request('/auth/change-password/pin', { method: 'POST' });
}

export async function logout(){
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
  return request('/auth/profile', { method:'PATCH', body: partial })
    .then(res => {
      if (res?.user){ localStorage.setItem('user', JSON.stringify(res.user)); return res.user; }
      return getCurrentUser();
    });
}

export async function deleteAccount({ email }){
  return request('/auth/account', { method:'DELETE', body:{ email } });
}

function saveAuth(res){
  localStorage.setItem('user', JSON.stringify(res.user));
  localStorage.removeItem('tokens');
}

export async function getCsrfToken() {
  return request('/auth/csrf', { method: 'GET' });
}
