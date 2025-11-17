import React from 'react';
import toast from 'react-hot-toast';
import {
  adminListReports,
  approveReport,
  rejectReport,
  purgeOrphans,
  countOrphans,
  resetReportStatus,
} from '../services/reports';
import { t } from '../i18n/strings';
import { resolveAssetUrl } from '../utils/api';

const statusMeta = {
  pending: {
    label: 'รอตรวจสอบ',
    badge:
      'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-200',
  },
  approved: {
    label: 'ยืนยันแล้ว',
    badge:
      'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  rejected: {
    label: 'ถูกปฏิเสธ',
    badge:
      'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-red-500/20 dark:text-red-200',
  },
};

const ActionButton = ({ label, onClick, variant = 'primary', disabled }) => {
  const styles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    outline:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:text-gray-200 dark:border-gray-500/40 dark:hover:bg-gray-700/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition 
        ${styles[variant]} disabled:opacity-40`}
    >
      {label}
    </button>
  );
};

// ปุ่มดู/ซ่อนรายละเอียด (สีเทา)
const DetailButton = ({ expanded, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold
             bg-gray-700 text-gray-200 border border-gray-600
             hover:bg-gray-600 transition"
  >
    {expanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
  </button>
);

// Popup ยืนยัน Yes / No
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-sm text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-slate-200">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-slate-800 text-slate-200 border border-slate-700
                       hover:bg-slate-700 transition"
          >
            ไม่ใช่
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-emerald-600 text-white border border-emerald-500
                       hover:bg-emerald-500 transition"
          >
            ใช่
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminReports() {
  const [rows, setRows] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [purgeState, setPurgeState] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null);
  const [acting, setActing] = React.useState('');
  const [lightboxState, setLightboxState] = React.useState(null);

  // สำหรับ popup ยืนยันอนุมัติ/ปฏิเสธ
  // { type: 'approve' | 'reject', row }
  const [pendingAction, setPendingAction] = React.useState(null);

  const openLightbox = React.useCallback((urls = [], index = 0) => {
    if (!urls.length) return;
    setLightboxState({ urls, index });
  }, []);

  const closeLightbox = React.useCallback(() => setLightboxState(null), []);

  const showPrevImage = React.useCallback(() => {
    setLightboxState((prev) => {
      if (!prev || prev.urls.length <= 1) return prev;
      const total = prev.urls.length;
      const nextIndex = (prev.index - 1 + total) % total;
      return { ...prev, index: nextIndex };
    });
  }, []);

  const showNextImage = React.useCallback(() => {
    setLightboxState((prev) => {
      if (!prev || prev.urls.length <= 1) return prev;
      const total = prev.urls.length;
      const nextIndex = (prev.index + 1) % total;
      return { ...prev, index: nextIndex };
    });
  }, []);

  const hasLightboxNavigation = (lightboxState?.urls?.length || 0) > 1;
  const currentLightboxUrl =
    lightboxState?.urls?.[lightboxState.index] || '';

  const refresh = React.useCallback(async () => {
    try {
      const list = await adminListReports();
      setRows(list);
    } catch (err) {
      setError('โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }

    try {
      const orphanInfo = await countOrphans();
      setPurgeState(orphanInfo);
    } catch {}
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const applyUpdate = (u) => {
    setRows((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  };

  const performAction = async (id, fn, key) => {
    setActing(id + key);

    try {
      const updated = await fn(id);
      applyUpdate(updated);
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setActing('');
    }
  };

  const onApprove = (id) => performAction(id, approveReport, 'approve');
  const onReject = (id) => performAction(id, rejectReport, 'reject');
  const onReset = (id) => performAction(id, resetReportStatus, 'reset');

  const onPurge = async () => {
    try {
      await purgeOrphans();
      toast.success('ลบข้อมูลขยะแล้ว');
      refresh();
    } catch {}
  };

  const unknown = '-';
  const fmt = (v) => (v ? new Date(v).toLocaleDateString('th-TH') : unknown);
  const money = (v) => `${Number(v || 0).toLocaleString('th-TH')} บาท`;

  const renderActions = (row, expanded, toggle) => (
    <div className="flex gap-2">
      {row.status === 'pending' && (
        <>
          <ActionButton
            label="อนุมัติ"
            onClick={() => setPendingAction({ type: 'approve', row })}
            disabled={acting === row.id + 'approve'}
          />
          <ActionButton
            label="ปฏิเสธ"
            variant="danger"
            onClick={() => setPendingAction({ type: 'reject', row })}
            disabled={acting === row.id + 'reject'}
          />
        </>
      )}

      {(row.status === 'approved' || row.status === 'rejected') && (
        <ActionButton
          label="ยกเลิกผล"
          variant="outline"
          onClick={() => onReset(row.id)}
          disabled={acting === row.id + 'reset'}
        />
      )}

      <DetailButton expanded={expanded} onClick={toggle} />
    </div>
  );

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { type, row } = pendingAction;
    setPendingAction(null);
    if (type === 'approve') {
      await onApprove(row.id);
    } else if (type === 'reject') {
      await onReject(row.id);
    }
  };

  const handleCancel = () => setPendingAction(null);

  const confirmTitle =
    pendingAction?.type === 'approve'
      ? 'ยืนยันการอนุมัติ'
      : pendingAction?.type === 'reject'
      ? 'ยืนยันการปฏิเสธ'
      : '';

  const confirmMessage = pendingAction
    ? pendingAction.type === 'approve'
      ? `คุณต้องการอนุมัติรายการรหัส ${pendingAction.row.id} ใช่หรือไม่?`
      : `คุณต้องการปฏิเสธรายการรหัส ${pendingAction.row.id} ใช่หรือไม่?`
    : '';

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">รายการแจ้งมิจฉาชีพ</h1>
            <p className="text-gray-400 text-sm">รายการทั้งหมดจากผู้ใช้งาน</p>
          </div>

          <button
            onClick={onPurge}
            className="px-4 py-2 rounded-xl text-sm font-semibold
                       bg-red-700 text-white hover:bg-red-600 
                       border border-red-800 shadow-lg"
          >
            ลบข้อมูลขยะ {purgeState?.count ? `(${purgeState.count})` : ''}
          </button>
        </div>

        {/* TABLE CARD (ใช้ grid แถวต่อแถว) */}
        <div className="rounded-3xl border border-slate-800 bg-[#020617]/95 shadow-xl overflow-hidden">
          {/* HEADER ROW */}
          <div
            className="grid grid-cols-[200px,1.3fr,1.2fr,1.1fr,1fr,auto] 
                          px-6 py-4 border-b border-slate-800/70 
                          text-[11px] font-semibold tracking-wide text-gray-300"
          >
            <span>รหัส</span>
            <span>ชื่อมิจฉาชีพ</span>
            <span>หมวดหมู่</span>
            <span>วันที่รายงาน</span>
            <span>จำนวนเงิน</span>
            <span className="text-right">สถานะ</span>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="p-6 text-gray-400">กำลังโหลด...</div>
          ) : error ? (
            <div className="p-6 text-red-400">{error}</div>
          ) : !rows || rows.length === 0 ? (
            <div className="p-6 text-gray-400">ยังไม่มีรายการแจ้ง</div>
          ) : (
            (rows || []).map((row) => {
              const expanded = expandedId === row.id;
              const meta = statusMeta[row.status] || statusMeta.pending;
              const resolvedPhotos =
                expanded && Array.isArray(row.photos)
                  ? row.photos.map((photo) => resolveAssetUrl(photo))
                  : [];
              const hasPhotos = resolvedPhotos.length > 0;

              return (
                <div key={row.id} className="border-b border-slate-800/60">
                  {/* MAIN ROW */}
                  <div
                    className="grid grid-cols-[200px,1.3fr,1.2fr,1.1fr,1fr,auto] 
                                  px-6 py-4 text-sm text-slate-200 bg-slate-950/40"
                  >
                    <span className="truncate break-all min-w-[200px]">
                      {row.id}
                    </span>
                    <span className="truncate">{row.name || unknown}</span>
                    <span className="truncate">{row.category || unknown}</span>
                    <span>{fmt(row.createdAt)}</span>
                    <span>{money(row.amount)}</span>

                    <div className="flex items-center justify-end gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}
                      >
                        {meta.label}
                      </span>

                      {renderActions(row, expanded, () =>
                        setExpandedId(expanded ? null : row.id)
                      )}
                    </div>
                  </div>

                  {/* DETAILS ROW */}
                  {expanded && (
                    <div className="px-6 py-5 bg-slate-950/70">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-white mb-2">
                          รายละเอียดเพิ่มเติม
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p>
                              <strong>ชื่อ:</strong> {row.name || unknown}
                            </p>
                            <p>
                              <strong>ธนาคาร:</strong> {row.bank || unknown}
                            </p>
                            <p>
                              <strong>เลขบัญชี:</strong> {row.account || unknown}
                            </p>
                            <p>
                              <strong>ช่องทาง:</strong> {row.channel || unknown}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p>
                              <strong>จำนวนเงิน:</strong> {money(row.amount)}
                            </p>
                            <p>
                              <strong>วันที่รายงาน:</strong> {fmt(row.createdAt)}
                            </p>
                            <p>
                              <strong>รายละเอียด:</strong>
                              <br />
                              {row.desc || unknown}
                            </p>
                          </div>
                        </div>

                        {/* PHOTOS */}
                        <div>
                          <h3 className="font-semibold text-white mb-2">
                            หลักฐาน
                          </h3>

                          {hasPhotos ? (
                            <div className="flex flex-wrap gap-3">
                              {resolvedPhotos.map((resolved, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => openLightbox(resolvedPhotos, idx)}
                                  className="focus:outline-none"
                                >
                                  <img
                                    src={resolved}
                                    className="w-24 h-24 rounded-lg object-cover border border-slate-700"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400">ไม่มีรูปหลักฐาน</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LIGHTBOX รูปหลักฐาน */}
      {lightboxState && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {hasLightboxNavigation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrevImage();
              }}
              className="absolute left-6 md:left-12 text-white w-14 h-14 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 flex items-center justify-center shadow-lg transition disabled:opacity-40"
              aria-label="Previous image"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <div
            className="relative max-w-3xl w-full flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentLightboxUrl}
              alt="evidence-full"
              className="w-full max-h-[80vh] object-contain rounded-3xl border border-white/20 bg-black"
            />
          </div>

          {hasLightboxNavigation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNextImage();
              }}
              className="absolute right-6 md:right-12 text-white w-14 h-14 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 flex items-center justify-center shadow-lg transition disabled:opacity-40"
              aria-label="Next image"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* POPUP ยืนยัน อนุมัติ / ปฏิเสธ */}
      <ConfirmDialog
        open={!!pendingAction}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
