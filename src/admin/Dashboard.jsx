import React from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListReports } from '../services/reports';
import { t } from '../i18n/strings';

export default function AdminDashboard(){
  const nav = useNavigate();
  const [stats, setStats] = React.useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [latest, setLatest] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try{
        const list = await adminListReports();
        if (!alive) return;
        const pending = list.filter(x => x.status === 'pending').length;
        const approved = list.filter(x => x.status === 'approved').length;
        const rejected = list.filter(x => x.status === 'rejected').length;
        const total = list.length;
        setStats({ pending, approved, rejected, total });
        setLatest(list.slice(0,5));
      } finally { setLoading(false); }
    })();
    return () => { alive = false };
  }, []);

  const dashboardCopy = t('admin.dashboard');
  const tiles = [
    { k: dashboardCopy?.tiles?.pending || t('admin.dashboard.tiles.pending'), v: stats.pending },
    { k: dashboardCopy?.tiles?.approved || t('admin.dashboard.tiles.approved'), v: stats.approved },
    { k: dashboardCopy?.tiles?.rejected || t('admin.dashboard.tiles.rejected'), v: stats.rejected },
    { k: dashboardCopy?.tiles?.total || t('admin.dashboard.tiles.total'), v: stats.total },
  ];

  const resolveCategory = (cat) => {
    const map = {
      'investment': 'การลงทุน',
      'shopping': 'ซื้อของออนไลน์',
      'loan': 'กู้เงิน',
      'job': 'หางาน',
      'romance': 'หลอกให้รัก',
      'identity': 'ปลอมแปลงเอกสาร',
      'other': 'อื่นๆ'
    };
    return map[cat?.toLowerCase()] || cat || '-';
  };

  const renderPendingSubtitle = (category, dateStr) => {
    return `หมวดหมู่: ${resolveCategory(category)} • ${dateStr}`;
  };

  const renderActivityLabel = (row) => {
    const { name, status } = row;
    if (status === 'approved') {
      return `อนุมัติ ${name}`;
    }
    if (status === 'rejected') {
      return `ปฏิเสธ ${name}`;
    }
    return `รอตรวจสอบ ${name}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{dashboardCopy?.title || t('admin.dashboard.title')}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((c)=>(
          <div key={c.k} className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4">
            <div className="text-3xl font-extrabold">{(c.v||0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.k}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 h-[280px]">
          <h2 className="font-bold mb-3">{dashboardCopy?.notificationsTitle || t('admin.dashboard.notificationsTitle')}</h2>
          {loading ? (
            <div className="text-sm text-gray-500">{dashboardCopy?.loading || t('admin.dashboard.loading', t('common.loading'))}</div>
          ) : (
          <ul className="divide-y dark:divide-gray-800">
            {(latest||[]).filter(x=>x.status==='pending').slice(0,3).map((r)=> (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name || t('common.unknown')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {renderPendingSubtitle(r.category || '-', new Date(r.createdAt).toLocaleString())}
                  </div>
                </div>
                <button onClick={()=>nav('/admin/reports')} className="px-3 py-1.5 rounded-lg border text-sm">
                  {dashboardCopy?.actions?.review || t('admin.actions.review')}
                </button>
              </li>
            ))}
            {latest.filter(x=>x.status==='pending').length === 0 && (
              <li className="py-3 text-sm text-gray-500">{dashboardCopy?.empty || t('admin.dashboard.empty', 'No pending items')}</li>
            )}
          </ul>) }
        </div>

        <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 h-[280px]">
          <h2 className="font-bold mb-3">{dashboardCopy?.activitiesTitle || t('admin.dashboard.activitiesTitle')}</h2>
          {loading ? (
            <div className="text-sm text-gray-500">{dashboardCopy?.loading || t('admin.dashboard.loading', t('common.loading'))}</div>
          ) : (
          <ul className="space-y-2 text-sm">
            {(latest||[]).map((r)=> (
              <li key={r.id} className="flex items-center justify-between">
                <span>{renderActivityLabel(r)}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(r.updatedAt || r.createdAt).toLocaleString('th-TH', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>) }
        </div>
      </div>
    </div>
  );
}
