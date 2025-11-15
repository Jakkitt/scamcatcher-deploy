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
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{pageCopy?.title || t('admin.usersPage.title')}</h1>
      <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">{pageCopy?.loading || t('common.loading')}</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b dark:border-gray-800">
              <th className="p-3">{pageCopy?.columns?.id || 'ID'}</th>
              <th className="p-3">{pageCopy?.columns?.username || 'Username'}</th>
              <th className="p-3">{pageCopy?.columns?.email || 'Email'}</th>
              <th className="p-3">{pageCopy?.columns?.joined || 'Joined'}</th>
              <th className="p-3">{pageCopy?.columns?.reports || 'Reports'}</th>
              <th className="p-3">{pageCopy?.columns?.status || 'Status'}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(rows||[]).map(u => (
              <tr key={u.id} className="border-b last:border-b-0 dark:border-gray-800">
                <td className="p-3 break-all">{u.id}</td>
                <td className="p-3">{u.username || '-'}</td>
                <td className="p-3 break-all">{u.email}</td>
                <td className="p-3">{new Date(u.joinedAt).toLocaleDateString()}</td>
                <td className="p-3">{u.reports}</td>
                <td className="p-3">{resolveStatus(u)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2 justify-end whitespace-nowrap">
                    {u.role !== 'admin' && (
                    <button
                      onClick={()=>onSuspend(u.id, true)}
                      disabled={u.suspended || acting===u.id+'true' || me?.id===u.id}
                      className="h-8 px-3 rounded border text-xs bg-white dark:bg-gray-900 disabled:opacity-50"
                      title={suspendTooltip(u.id)}
                    >{pageCopy?.actions?.suspend || 'Suspend'}</button>)}
                    {u.role !== 'admin' && (
                    <button
                      onClick={()=>onSuspend(u.id, false)}
                      disabled={!u.suspended || acting===u.id+'false' || me?.id===u.id}
                      className="h-8 px-3 rounded border text-xs bg-white dark:bg-gray-900 disabled:opacity-50"
                      title={unsuspendTooltip(u.id)}
                    >{pageCopy?.actions?.unsuspend || 'Unsuspend'}</button>)}
                    <button
                      onClick={()=>onDelete(u.id)}
                      disabled={acting==='del'+u.id || u.role==='admin' || me?.id===u.id}
                      className="h-8 px-3 rounded border text-xs bg-white dark:bg-gray-900 disabled:opacity-50"
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
  );
}
