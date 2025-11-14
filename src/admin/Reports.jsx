import React from 'react';
import toast from 'react-hot-toast';
import { adminListReports, approveReport, rejectReport, purgeOrphans, countOrphans, resetReportStatus } from '../services/reports';
import { t } from '../i18n/strings';
import { resolveAssetUrl } from '../utils/api';

const statusMeta = {
  pending: {
    label: t('admin.statuses.pending'),
    badge: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/40',
    chip: 'bg-amber-500 text-white',
  },
  approved: {
    label: t('admin.statuses.approved'),
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
    chip: 'bg-emerald-500 text-white',
  },
  rejected: {
    label: t('admin.statuses.rejected'),
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
  const [lightboxUrl, setLightboxUrl] = React.useState('');

  const refresh = React.useCallback(async () => {
    setError('');
    try{
      const list = await adminListReports();
      setRows(list);
    }catch(err){
      setError(err?.message || t('admin.errorLoading'));
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
      toast.error(err?.message || t('admin.actionFailed'));
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
      toast.success(t('admin.purgeSuccess'));
    }catch(err){
      toast.error(err?.message || t('admin.purgeError'));
    }
  };

  const currencyLabel = t('common.currencyBaht');
  const unknownLabel = t('common.unknown');
  const formatAmount = (value) => `${Number(value || 0).toLocaleString('th-TH')} ${currencyLabel}`;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : unknownLabel;

  const renderActions = (row) => {
    const isActing = (key) => acting === `${row.id}-${key}`;
    if (row.status === 'pending') {
      return (
        <>
          <ActionButton label={t('admin.actions.approve')} onClick={() => onApprove(row.id)} disabled={isActing('approve')} />
          <ActionButton label={t('admin.actions.reject')} variant="danger" onClick={() => onReject(row.id)} disabled={isActing('reject')} />
        </>
      );
    }
    if (row.status === 'approved') {
      return (
        <ActionButton label={t('admin.actions.revokeApprove')} variant="outline" onClick={() => onReset(row.id)} disabled={isActing('reset')} />
      );
    }
    return (
      <ActionButton label={t('admin.actions.revokeReject')} variant="outline" onClick={() => onReset(row.id)} disabled={isActing('reset')} />
    );
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{t('admin.reportsTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.reportsSubtitle')}</p>
        </div>
        <button
          onClick={onPurge}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-black text-white border border-black/10 shadow-lg shadow-black/20 hover:bg-gray-900 transition dark:bg-transparent dark:text-cyan-200 dark:border-cyan-400/40 dark:hover:bg-cyan-400/10"
        >
          {t('admin.purgeButton')} {purgeState?.count ? `(${purgeState.count})` : ''}
        </button>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white/95 dark:border-white/10 dark:bg-[#030712]/70 backdrop-blur shadow-2xl shadow-cyan-500/10">
        <div className="grid grid-cols-[auto,1.5fr,1.2fr,1.1fr,1fr,1fr,auto] text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <span />
          <span>{t('admin.table.code')}</span>
          <span>{t('admin.table.suspect')}</span>
          <span>{t('admin.table.category')}</span>
          <span>{t('admin.table.reportedDate')}</span>
          <span>{t('admin.table.amount')}</span>
          <span className="text-right">{t('admin.table.status')}</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">{t('common.loading')}</div>
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
                    aria-label={t('admin.aria.toggleDetails')}
                  >
                    ▶
                  </button>
                  <span className="truncate">{row.id}</span>
                    <span className="truncate">{row.name || unknownLabel}</span>
                    <span className="truncate">{row.category || unknownLabel}</span>
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
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">{t('admin.detailsHeading')}</h3>
                            <dl className="space-y-1 text-gray-600 dark:text-gray-300">
                              <div className="flex justify-between"><dt>{t('admin.fields.fullName')}</dt><dd className="font-semibold text-gray-900 dark:text-white">{row.name || unknownLabel}</dd></div>
                              <div className="flex justify-between"><dt>{t('admin.fields.bank')}</dt><dd>{row.bank || unknownLabel}</dd></div>
                              <div className="flex justify-between"><dt>{t('admin.fields.account')}</dt><dd>{row.account || unknownLabel}</dd></div>
                              <div className="flex justify-between"><dt>{t('admin.fields.channel')}</dt><dd>{row.channel || unknownLabel}</dd></div>
                              <div className="flex justify-between"><dt>{t('admin.fields.category')}</dt><dd>{row.category || unknownLabel}</dd></div>
                            </dl>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">{t('admin.reportHeading')}</h3>
                            <dl className="space-y-1 text-gray-600 dark:text-gray-300">
                              <div className="flex justify-between"><dt>{t('admin.fields.transferAmount')}</dt><dd>{formatAmount(row.amount)}</dd></div>
                              <div className="flex justify-between"><dt>{t('admin.fields.reportedDate')}</dt><dd>{formatDate(row.createdAt)}</dd></div>
                              <div><dt className="font-semibold text-gray-900 dark:text-white">{t('admin.fields.extraDetail')}</dt><p className="text-gray-600 dark:text-gray-300">{row.desc || unknownLabel}</p></div>
                            </dl>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 dark:text-white">{t('admin.evidenceHeading')}</h3>
                          {row.photos && row.photos.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                              {row.photos.map((url, idx) => {
                                const resolvedUrl = resolveAssetUrl(url);
                                return (
                                <button
                                  key={url || idx}
                                  type="button"
                                  onClick={() => setLightboxUrl(resolvedUrl)}
                                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
                                >
                                  <img
                                    src={resolvedUrl}
                                    alt={`evidence-${idx}`}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-cyan-400/40"
                                  />
                                </button>
                              );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">{t('admin.noEvidence')}</p>
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
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl('')}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl('')}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-black text-white text-lg"
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={lightboxUrl}
              alt="evidence-full"
              className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}
