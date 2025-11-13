import React from 'react';
import { adminListReports, approveReport, rejectReport, purgeOrphans, countOrphans, resetReportStatus } from '../services/reports';

const statusMeta = {
  pending: {
    label: 'รออนุมัติ',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/40',
    chip: 'bg-amber-500 text-white',
  },
  approved: {
    label: 'อนุมัติแล้ว',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
    chip: 'bg-emerald-500 text-white',
  },
  rejected: {
    label: 'ปฏิเสธแล้ว',
    badge: 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30',
    chip: 'bg-red-500 text-white',
  },
};

const ActionButton = ({ label, onClick, variant='primary', disabled }) => {
  const styles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400',
    danger: 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-500',
    outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:text-white dark:border-white/30 dark:hover:bg-white/10',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
};

export default function AdminReports(){
  const [rows, setRows] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [purgeState, setPurgeState] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null);
  const [acting, setActing] = React.useState('');

  const refresh = React.useCallback(async () => {
    setError('');
    try{
      const list = await adminListReports();
      setRows(list);
    }catch(err){
      setError(err?.message || 'ไม่สามารถโหลดรายงานได้');
    }finally{
      setLoading(false);
    }
    try{
      const orphanInfo = await countOrphans();
      setPurgeState(orphanInfo);
    }catch(err){
      console.warn(err);
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      await refresh();
      if (!alive) return;
    })();
    return () => { alive = false };
  }, [refresh]);

  const applyUpdate = (updated) => {
    setRows(prev => prev?.map(x => x.id === updated.id ? updated : x) || []);
  };

  const handleAction = async (id, actionFn, key) => {
    setActing(`${id}-${key}`);
    try{
      const updated = await actionFn(id);
      applyUpdate(updated);
    }catch(err){
      alert(err?.message || 'ดำเนินการไม่สำเร็จ');
    }finally{
      setActing('');
    }
  };

  const onApprove = (id) => handleAction(id, approveReport, 'approve');
  const onReject = (id) => handleAction(id, rejectReport, 'reject');
  const onReset = (id) => handleAction(id, resetReportStatus, 'reset');

  const onPurge = async ()=>{
    try{
      await purgeOrphans();
      await refresh();
      alert('ล้างรายงานกำพร้าแล้ว');
    }catch(err){
      alert(err?.message || 'ไม่สามารถล้างรายงานได้');
    }
  };

  const formatAmount = (value) => `${Number(value || 0).toLocaleString('th-TH')} บาท`;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-';

  const renderActions = (row) => {
    const isActing = (key) => acting === `${row.id}-${key}`;
    if (row.status === 'pending') {
      return (
        <>
          <ActionButton label="อนุมัติ" onClick={() => onApprove(row.id)} disabled={isActing('approve')} />
          <ActionButton label="ปฏิเสธ" variant="danger" onClick={() => onReject(row.id)} disabled={isActing('reject')} />
        </>
      );
    }
    if (row.status === 'approved') {
      return (
        <ActionButton label="ยกเลิกอนุมัติ" variant="outline" onClick={() => onReset(row.id)} disabled={isActing('reset')} />
      );
    }
    return (
      <ActionButton label="ยกเลิกปฏิเสธ" variant="outline" onClick={() => onReset(row.id)} disabled={isActing('reset')} />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">จัดการรายงานมิจฉาชีพ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">ตรวจสอบสถานะรายงาน ปรับสถานะ และดูรายละเอียดหลักฐาน</p>
        </div>
        <button
          onClick={onPurge}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-black text-white border border-black/10 shadow-lg shadow-black/20 hover:bg-gray-900 transition dark:bg-transparent dark:text-cyan-200 dark:border-cyan-400/40 dark:hover:bg-cyan-400/10"
        >
          ล้างรายงานกำพร้า {purgeState?.count ? `(${purgeState.count})` : ''}
        </button>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white/95 dark:border-white/10 dark:bg-[#030712]/70 backdrop-blur shadow-2xl shadow-cyan-500/10">
        <div className="grid grid-cols-[auto,1.5fr,1.2fr,1.1fr,1fr,1fr,auto] text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <span />
          <span>รหัส</span>
          <span>ชื่อมิจฉาชีพ</span>
          <span>หมวดหมู่</span>
          <span>วันที่รายงาน</span>
          <span>จำนวนเงิน</span>
          <span className="text-right">สถานะ</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">กำลังโหลด…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-500">{error}</div>
        ) : (
          <div>
            {(rows || []).map((row) => {
              const meta = statusMeta[row.status] || statusMeta.pending;
              const expanded = expandedId === row.id;
              return (
                <div key={row.id} className="border-b border-gray-100 dark:border-white/10">
                <div className="grid grid-cols-[auto,1.5fr,1.2fr,1.1fr,1fr,1fr,auto] items-center px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <button
                    onClick={() => setExpandedId(expanded ? null : row.id)}
                    className={`text-cyan-600 transition transform dark:text-cyan-300 ${expanded ? 'rotate-90' : ''}`}
                    aria-label="แสดงรายละเอียด"
                  >
                    ▶
                  </button>
                  <span className="truncate">{row.id}</span>
                    <span className="truncate">{row.name || '-'}</span>
                    <span className="truncate">{row.category || '-'}</span>
                    <span>{formatDate(row.createdAt)}</span>
                    <span>{formatAmount(row.amount)}</span>
                    <div className="flex items-center justify-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>{meta.label}</span>
                      <div className="flex gap-2">{renderActions(row)}</div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-6 pb-6">
                      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-50/80 via-white to-white p-6 text-sm text-gray-700 space-y-4 dark:border-white/10 dark:bg-gradient-to-br dark:from-gray-900/70 dark:via-gray-900/50 dark:to-gray-900/40 dark:text-gray-200">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">รายละเอียดของผู้ถูกร้องเรียน</h3>
                            <dl className="space-y-1 text-gray-600 dark:text-gray-300">
                              <div className="flex justify-between"><dt>ชื่อ-นามสกุล</dt><dd className="font-semibold text-gray-900 dark:text-white">{row.name || '-'}</dd></div>
                              <div className="flex justify-between"><dt>ธนาคาร</dt><dd>{row.bank || '-'}</dd></div>
                              <div className="flex justify-between"><dt>เลขบัญชี</dt><dd>{row.account || '-'}</dd></div>
                              <div className="flex justify-between"><dt>ช่องทาง</dt><dd>{row.channel || '-'}</dd></div>
                              <div className="flex justify-between"><dt>หมวดหมู่</dt><dd>{row.category || '-'}</dd></div>
                            </dl>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">ข้อมูลรายงาน</h3>
                            <dl className="space-y-1 text-gray-600 dark:text-gray-300">
                              <div className="flex justify-between"><dt>ยอดโอน</dt><dd>{formatAmount(row.amount)}</dd></div>
                              <div className="flex justify-between"><dt>วันที่รายงาน</dt><dd>{formatDate(row.createdAt)}</dd></div>
                              <div><dt className="font-semibold text-gray-900 dark:text-white">รายละเอียดเพิ่มเติม</dt><p className="text-gray-600 dark:text-gray-300">{row.desc || '-'}</p></div>
                            </dl>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 dark:text-white">หลักฐาน</h3>
                          {row.photos && row.photos.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                              {row.photos.map((url, idx) => (
                                <img
                                  key={url || idx}
                                  src={url}
                                  alt={`evidence-${idx}`}
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-cyan-400/40"
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">ไม่มีรูปหลักฐาน</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
