import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getReportDetail } from '../services/reports';
import { fetchExternalChecks } from '../services/external';
import { t } from '../i18n/strings';

const statusConfig = {
  pending: {
    label: t('admin.statuses.pending'),
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  },
  approved: {
    label: t('admin.statuses.approved'),
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  rejected: {
    label: t('admin.statuses.rejected'),
    badge: 'bg-rose-100 text-rose-700 dark:bg-red-500/20 dark:text-red-200',
  },
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.item;
  const [report, setReport] = React.useState(
    initial && initial.id === id ? initial : null
  );
  const [loading, setLoading] = React.useState(!report);
  const [error, setError] = React.useState('');
  const [lightbox, setLightbox] = React.useState({ open: false, index: 0 });
  const [externalSources, setExternalSources] = React.useState({
    loading: false,
    bls: { skipped: true },
  });

  React.useEffect(() => {
    let alive = true;
    if (report) return () => {};
    (async () => {
      setLoading(true);
      setError('');
      try {
        const detail = await getReportDetail(id);
        if (!alive) return;
        setReport(detail);
      } catch (e) {
        if (!alive) return;
        const message = e?.message || t('admin.errorLoading');
        setError(message);
        toast.error(message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, report]);

  const fmt = (value) =>
    value ? new Date(value).toLocaleDateString('th-TH') : t('common.unknown');
  const money = (value) =>
    `${Number(value || 0).toLocaleString('th-TH')} ${t('common.currencyBaht')}`;
  const meta = report ? statusConfig[report.status] || statusConfig.pending : null;

  React.useEffect(() => {
    let cancelled = false;
    if (!report) return () => {};
    const query = {
      name: report.name || '',
      account: report.account || '',
      bank: report.bank || '',
    };
    if (!query.name && !query.account && !query.bank) {
      setExternalSources({ loading: false, bls: { skipped: true } });
      return () => {};
    }
    setExternalSources((prev) => ({ ...prev, loading: true }));
    (async () => {
      try {
        const data = await fetchExternalChecks(query);
        if (cancelled) return;
        const source = data?.sources?.blacklistseller || { found: false };
        const formattedTime = data?.checkedAt
          ? new Date(data.checkedAt).toLocaleString('th-TH', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : undefined;
        setExternalSources({
          loading: false,
          checkedAt: formattedTime,
          bls: {
            ...source,
            link: source.link || source.sourceUrl,
          },
        });
      } catch (err) {
        if (cancelled) return;
        setExternalSources({
          loading: false,
          bls: { found: false, error: err?.message },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [report]);

  const blsResult = {
    ...(externalSources.bls || {}),
    loading: externalSources.loading,
    lastChecked: externalSources.checkedAt,
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* พื้นหลังสไตล์เดียวกับ Login */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] dark:opacity-5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-400/20 blur-[110px] rounded-full pointer-events-none dark:bg-blue-600/25" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[520px] bg-cyan-300/15 blur-[100px] rounded-full pointer-events-none dark:bg-cyan-500/15" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          ← ย้อนกลับ
        </button>

        {loading ? (
          <div className="mt-10 text-center text-gray-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : error ? (
          <div className="mt-10 text-center text-red-500">{error}</div>
        ) : (
          <div
            className="mt-6 rounded-3xl p-6 md:p-8 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                       dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
          >
            <div className="grid gap-6">
              <section className="rounded-3xl border border-gray-200 bg-white shadow-xl text-gray-900 dark:border-white/10 dark:bg-[#060b18] dark:text-gray-100">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-white/10">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      รายละเอียดของผู้ที่มีประวัติการโกง
                    </p>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                      ⚠️ ข้อมูลมิจฉาชีพ
                    </h1>
                  </div>
                  {meta && (
                    <span
                      className={`inline-flex h-8 items-center rounded-full px-4 text-sm font-semibold shadow-sm ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  )}
                </header>

                <div className="px-6 py-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 text-sm">
                    <DetailRow
                      label="ชื่อ-นามสกุลผู้ถูกรายงาน"
                      value={report?.name || t('common.unknown')}
                      emphasize
                    />
                    <DetailRow
                      label="ยอดโอน"
                      value={money(report?.amount)}
                      emphasize
                    />
                    <DetailRow
                      label="หมายเลขบัญชีธนาคาร"
                      value={report?.account || t('common.unknown')}
                    />
                    <DetailRow
                      label="ช่องทางการขาย"
                      value={
                        report?.channel === 'OTHER'
                          ? 'อื่นๆ'
                          : report?.channel || t('common.unknown')
                      }
                      emphasize
                    />
                    <DetailRow
                      label="วันที่โอนเงิน"
                      value={fmt(report?.createdAt)}
                      emphasize
                    />
                    <DetailRow
                      label="ธนาคาร"
                      value={report?.bank || t('common.unknown')}
                    />
                    <DetailRow
                      label="หมวดหมู่"
                      value={
                        {
                          investment: 'หลอกลงทุน',
                          shopping: 'ซื้อของออนไลน์',
                          job: 'หลอกทำงาน',
                          loan: 'เงินกู้',
                          romance: 'หลอกให้รัก',
                          bill: 'บิล/ภาษีปลอม',
                          other: 'อื่นๆ',
                        }[report?.category] || report?.category || t('common.unknown')
                      }
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      รายละเอียดเพิ่มเติม
                    </h3>
                    <p className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                      {report?.desc || '-'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      หลักฐาน
                    </h3>
                    {report?.photos?.length ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        {report.photos.map((url, idx) => (
                          <button
                            type="button"
                            key={url || idx}
                            onClick={() =>
                              setLightbox({ open: true, index: idx })
                            }
                            className="rounded-2xl border border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          >
                            <img
                              src={url}
                              alt={`evidence-${idx}`}
                              className="h-40 w-full rounded-xl object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="h-40 rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {lightbox.open && report?.photos?.length ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox({ open: false, index: 0 })}
          role="dialog"
          aria-modal="true"
        >
          {report.photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => ({
                  open: true,
                  index:
                    (prev.index - 1 + report.photos.length) %
                    report.photos.length,
                }));
              }}
              className="absolute left-8 text-white w-14 h-14 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 flex items-center justify-center shadow-lg transition"
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
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={report.photos[lightbox.index]}
              alt="evidence-full"
              className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 bg-black"
            />
          </div>

          {report.photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => ({
                  open: true,
                  index: (prev.index + 1) % report.photos.length,
                }));
              }}
              className="absolute right-8 text-white w-14 h-14 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 flex items-center justify-center shadow-lg transition"
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
      ) : null}
    </div>
  );
}

function DetailRow({ label, value, emphasize }) {
  const textClass = emphasize
    ? 'text-base font-semibold text-gray-900 dark:text-white'
    : 'text-base';
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className={textClass}>{value}</p>
    </div>
  );
}

const STATUS_STYLES = {
  loading: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200",
  found: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  missing: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  error: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  disabled: "bg-gray-200 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
  skipped: "bg-gray-200 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
};

function ExternalSource({ name, result = {} }) {
  const copy = t('externalChecks') || {};
  
  const status = result.loading
    ? "loading"
    : result.reason === "disabled"
    ? "disabled"
    : result.skipped
    ? "skipped"
    : result.error
    ? "error"
    : result.found
    ? "found"
    : "missing";

  const labels = {
    found: copy.badgeFound,
    error: copy.badgeError,
    loading: copy.badgeLoading,
    disabled: copy.badgeDisabled || copy.badgeMissing,
    skipped: copy.badgeSkipped || copy.badgeMissing,
    missing: copy.badgeMissing,
  };

  const badgeLabel = labels[status] || copy.badgeMissing;
  const badgeClass = STATUS_STYLES[status] || STATUS_STYLES.missing;
  
  let description;
  if (result.loading) description = copy.loading;
  else if (result.reason === "disabled") description = copy.disabledByAdmin || copy.disabled || copy.skipped;
  else if (result.error) description = copy.error || result.error;
  else if (result.found) {
      if (result.count) {
          description = `พบประวัติผู้กระทำผิดในฐานข้อมูล • พบ ${result.count} รายการ`;
      } else {
          description = copy.detailFound;
      }
  }
  else if (result.skipped) description = copy.skipped || copy.detailMissing;
  else description = copy.detailMissing;

  const matches = Array.isArray(result.matches) ? result.matches : [];

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3 dark:border-gray-800 bg-white dark:bg-transparent" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{name}</div>
          <div className={`text-xs ${result.error ? "text-rose-500" : "text-gray-500 dark:text-gray-400"}`}>
            {description}
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      {!result.loading && matches.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          {matches.slice(0, 3).map((match) => (
            <li key={match.id || match.account || match.name} className="flex justify-between gap-2">
              <span className="font-medium truncate">{match.name || match.account}</span>
              {match.bank && <span className="text-gray-400">{match.bank}</span>}
            </li>
          ))}
        </ul>
      )}

      {result.lastChecked && (
        <div className="text-[11px] text-gray-400 dark:text-gray-500">
          {copy.updated ? copy.updated(result.lastChecked) : result.lastChecked}
          {result.cached && <span className="ml-1 text-cyan-500">{copy.cached || '(cached)'}</span>}
        </div>
      )}

      {status === 'found' && (
        <div className="mt-1">
             <a
                href="https://www.blacklistseller.com/"
                target="_blank"
                rel="noreferrer" 
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl transition-colors dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600"
             >
                <span>ตรวจสอบข้อมูลเพิ่มเติม</span>
             </a>
        </div>
      )}
    </div>
  );
}
