import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getReportDetail } from '../services/reports';
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

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black dark:text-gray-100">
      <div className="container py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          ← ย้อนกลับ
        </button>

        {loading ? (
          <div className="mt-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="mt-10 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2.2fr,1fr] mt-6">
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
                    label="ชื่อ-นามสกุลผู้กระทำผิด"
                    value={report?.name || t('common.unknown')}
                    emphasize
                  />
                  <DetailRow label="ยอดโอน" value={money(report?.amount)} emphasize />
                  <DetailRow
                    label="หมายเลขบัญชีธนาคาร"
                    value={report?.account || t('common.unknown')}
                  />
                  <DetailRow
                    label="ช่องทางการขาย"
                    value={report?.channel || t('common.unknown')}
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
                    value={report?.category || t('common.unknown')}
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
                          onClick={() => setLightbox({ open: true, index: idx })}
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

            <aside className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 dark:border-white/10 dark:bg-[#060b18] dark:text-gray-100 shadow-lg">
              <div className="mb-4">
                <h2 className="text-xl font-bold">ตรวจสอบจากแหล่งภายนอก</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ข้อมูลจากแหล่งอื่นที่เกี่ยวข้อง
                </p>
              </div>

              <div className="space-y-3">
                <ExternalSource
                  name="Blacklistseller.com"
                  status="พบข้อมูล"
                  description="พบข้อมูลผู้กระทำผิดในฐานข้อมูล Blacklistseller"
                  href="https://www.blacklistseller.com/"
                />
              </div>
            </aside>
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
                  index: (prev.index - 1 + report.photos.length) % report.photos.length,
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
      <p className={textClass}>
        {value}
      </p>
    </div>
  );
}

function ExternalSource({ name, status, description, href }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 dark:border-white/10 bg-gray-50 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-200">
          {status}
        </span>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm text-cyan-600 underline hover:text-cyan-800 dark:text-cyan-300"
        >
          เปิดเว็บไซต์
        </a>
      )}
    </div>
  );
}
