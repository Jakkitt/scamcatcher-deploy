import { request } from '../utils/api';

export async function listUsers(){
  return request('/admin/users');
}

export async function suspendUser(id){
  return request(`/admin/users/${id}/suspend`, { method:'PATCH' });
}

export async function unsuspendUser(id){
  return request(`/admin/users/${id}/unsuspend`, { method:'PATCH' });
}

export async function deleteUser(id){
  return request(`/admin/users/${id}`, { method:'DELETE' });
}

export async function getExternalChecksSetting(){
  return request('/admin/settings/external-checks');
}

export async function updateExternalChecksSetting(enabled){
  return request('/admin/settings/external-checks', {
    method: 'PATCH',
    body: { enabled },
  });
}

export async function getAutoApproveSetting(){
  return request('/admin/settings/auto-approve');
}

export async function updateAutoApproveSetting({ enabled, threshold }){
  return request('/admin/settings/auto-approve', {
    method: 'PATCH',
    body: { enabled, threshold },
  });
}
