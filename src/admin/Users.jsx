import React from 'react';
import { listUsers, suspendUser, unsuspendUser, deleteUser } from '../services/admin';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n/strings';

export default function AdminUsers(){
  const { user: me } = useAuth();
  const [rows, setRows] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState('');

  React.useEffect(()=>{
    let alive = true;
    (async ()=>{
      const data = await listUsers();
      if (!alive) return; setRows(data); setLoading(false);
    })();
    return ()=>{ alive=false };
  },[]);

  const onSuspend = async (id, flag)=>{
    setActing(id+String(flag));
    try{
      if (flag) await suspendUser(id); else await unsuspendUser(id);
      setRows(prev => prev.map(x => x.id===id ? { ...x, suspended: flag } : x));
    }finally{ setActing(''); }
  };
  const pageCopy = t('admin.usersPage');

  const onDelete = async (id)=>{
    if (!confirm(pageCopy?.confirmDelete || t('admin.usersPage.confirmDelete', 'Are you sure you want to delete this user?'))) return;
    setActing('del'+id);
    try{ await deleteUser(id); setRows(prev => prev.filter(x => x.id!==id)); }finally{ setActing(''); }
  };

  const resolveStatus = (user) => {
    if (user.suspended) return pageCopy?.status?.suspended || 'Suspended';
    if (user.role === 'admin') return pageCopy?.status?.admin || 'Admin';
    return pageCopy?.status?.normal || 'Active';
  };

  const suspendTooltip = (targetId) => (me?.id===targetId ? (pageCopy?.tooltips?.noSelfSuspend || 'Cannot suspend your own account') : '');
  const unsuspendTooltip = (targetId) => (me?.id===targetId ? (pageCopy?.tooltips?.noSelfAction || 'Cannot manage your own account') : '');
  const deleteTooltip = (user) => {
    if (user.role === 'admin') return pageCopy?.tooltips?.noDeleteAdmin || 'Cannot delete admin accounts';
    if (me?.id === user.id) return pageCopy?.tooltips?.noDeleteSelf || 'Cannot delete yourself';
    return '';
  };

  return (
    <div className="space-y-6 min-w-full w-fit">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageCopy?.title || t('admin.usersPage.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">จัดการบัญชีผู้ใช้งานในระบบ</p>
      </div>
      
      <div className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#020617]/95">
        <div>
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">{pageCopy?.loading || t('common.loading')}</div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100 dark:border-slate-800/70 dark:bg-transparent">
              <tr className="text-[11px] font-semibold tracking-wide text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4 text-left">{pageCopy?.columns?.username || 'Username'}</th>
                <th className="px-6 py-4 text-left">{pageCopy?.columns?.email || 'Email'}</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">{pageCopy?.columns?.joined || 'Joined'}</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">{pageCopy?.columns?.reports || 'Reports'}</th>
                <th className="px-6 py-4 text-left">{pageCopy?.columns?.status || 'Status'}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {(rows||[]).map(u => (
                <tr key={u.id} className="border-b border-gray-100 bg-white dark:border-slate-800/60 dark:bg-slate-950/40">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">{u.username || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                    <div className="truncate max-w-xs">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">{new Date(u.joinedAt).toLocaleDateString('th-TH')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">{u.reports}</td>
                  <td className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {resolveStatus(u)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      {u.role !== 'admin' && (
                      <button
                        onClick={()=>onSuspend(u.id, true)}
                        disabled={u.suspended || acting===u.id+'true' || me?.id===u.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-red-600 text-white hover:bg-red-500 disabled:opacity-40"
                        title={suspendTooltip(u.id)}
                      >{pageCopy?.actions?.suspend || 'Suspend'}</button>)}
                      {u.role !== 'admin' && (
                      <button
                        onClick={()=>onSuspend(u.id, false)}
                        disabled={!u.suspended || acting===u.id+'false' || me?.id===u.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 disabled:opacity-40"
                        title={unsuspendTooltip(u.id)}
                      >{pageCopy?.actions?.unsuspend || 'Unsuspend'}</button>)}
                      <button
                        onClick={()=>onDelete(u.id)}
                        disabled={acting==='del'+u.id || u.role==='admin' || me?.id===u.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-red-600 text-white hover:bg-red-500 disabled:opacity-40"
                        title={deleteTooltip(u)}
                      >{pageCopy?.actions?.delete || 'Delete'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>) }
        </div>
      </div>
    </div>
  );
}
