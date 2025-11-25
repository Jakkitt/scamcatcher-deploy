// src/pages/Home1.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
  Phone,
  CreditCard,
  Link2,
  Shield as ShieldIcon,
  Lock,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { t } from '../i18n/strings';
import {
  fetchReportStats,
  fetchRecentReports,
  fetchFraudCategories,
} from '../services/reports';

const STAT_TEMPLATE = [
  {
    key: 'total',
    label: 'รายงานที่เข้ามาทั้งหมด',
    subtext: 'รวมทุกรายการที่ส่งเข้าระบบ',
    color: 'text-blue-600 dark:text-blue-300',
    icon: BarChart3,
    gradient:
      'from-white via-slate-50 to-sky-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950',
  },
  {
    key: 'approved',
    label: 'รายงานที่อนุมัติ',
    subtext: 'ผ่านการตรวจสอบและอนุมัติ',
    color: 'text-emerald-600 dark:text-emerald-300',
    icon: CheckCircle,
    gradient:
      'from-white via-emerald-50/70 to-slate-50 dark:from-slate-900/90 dark:via-emerald-900/30 dark:to-slate-950',
  },
  {
    key: 'rejected',
    label: 'รายงานที่ปฏิเสธ',
    subtext: 'รายการที่ไม่ผ่านการอนุมัติ',
    color: 'text-rose-600 dark:text-rose-300',
    icon: AlertTriangle,
    gradient:
      'from-white via-rose-50/70 to-slate-50 dark:from-slate-900/90 dark:via-rose-900/30 dark:to-slate-950',
  },
];

export default function Home1() {
  const [stats, setStats] = useState(
    STAT_TEMPLATE.map((item) => ({
      ...item,
      value: '0',
      trend: undefined,
      change: undefined,
    })),
  );
  const [recent, setRecent] = useState([]);
  const [fraudStats, setFraudStats] = useState({ total: 0, items: [] });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const summary = await fetchReportStats();
        if (!alive) return;
        setStats(
          STAT_TEMPLATE.map((item) => ({
            ...item,
            value: Number(summary?.[item.key] || 0).toLocaleString(),
            trend: undefined,
            change: undefined,
          })),
        );
      } catch (err) {
        console.warn('fetchReportStats failed', err);
      }
    })();

    (async () => {
      try {
        const latest = await fetchRecentReports(6);
        if (!alive) return;
        setRecent(latest || []);
      } catch (err) {
        console.warn('fetchRecentReports failed', err);
      }
    })();

    (async () => {
      try {
        const fraud = await fetchFraudCategories(30);
        if (!alive) return;
        setFraudStats({
          total: fraud?.total || 0,
          items: Array.isArray(fraud?.items) ? fraud.items : [],
        });
      } catch (err) {
        console.warn('fetchFraudCategories failed', err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      
      {/* SECTION 1: HERO */}
      <section className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden">
        {/* BG Light + Dark */}
        <div className="absolute inset-0 -z-10">
          {/* base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50 to-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-black" />

          {/* blobs light */}
          <div className="absolute -top-24 -left-10 w-[420px] h-[420px] bg-sky-200/70 blur-3xl rounded-full pointer-events-none dark:hidden" />
          <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-cyan-200/60 blur-3xl rounded-full pointer-events-none dark:hidden" />
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 blur-3xl rounded-full pointer-events-none dark:hidden" />

          {/* blobs dark */}
          <div className="hidden dark:block absolute -top-24 -left-10 w-[420px] h-[420px] bg-blue-800/40 blur-[120px] rounded-full pointer-events-none" />
          <div className="hidden dark:block absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-cyan-700/35 blur-[130px] rounded-full pointer-events-none" />
          <div className="hidden dark:block absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-purple-900/40 blur-[130px] rounded-full pointer-events-none" />

          {/* texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] dark:opacity-[0.08]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center justify-center h-full">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mt-5 mb-6 leading-tight animate-fade-in-up">
              รู้ทันโจรไซเบอร์ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                ตรวจสอบก่อนโอน มั่นใจปลอดภัย
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
              {t('layout.brand')} ช่วยให้คุณตรวจสอบประวัติการโกง เช็กเบอร์โทรและเลขบัญชีต้องสงสัย
              จากฐานข้อมูลที่รวบรวมโดยชุมชนผู้ใช้จริงทั่วประเทศ
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto animate-fade-in-up delay-200">
            {stats.map((stat) => {
              const Icon = stat.icon || BarChart3;
              const isUp = stat.trend !== 'down';
              return (
                <div
                  key={stat.label}
                  className="relative bg-gradient-to-br p-6 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/80 overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 dark:border-slate-700 dark:shadow-slate-900/50"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`}
                    aria-hidden="true"
                  ></div>
                  <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.7),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.25),transparent_40%)]" />

                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform dark:bg-slate-900/70 dark:border-slate-600 dark:text-white">
                        <Icon size={22} />
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        {stat.label}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-600 text-sm dark:text-slate-300">
                      {stat.subtext}
                    </div>
                  </div>

                  {stat.change && (
                    <div className="relative mt-4 flex items-center gap-2 text-sm font-semibold">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                          isUp
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-400/40 dark:text-emerald-200'
                            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-400/40 dark:text-rose-200'
                        }`}
                      >
                        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {stat.change}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">
                        เทียบช่วงก่อนหน้า
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="absolute bottom-8 animate-bounce text-slate-400 dark:text-slate-500">
            <ChevronDown size={32} />
          </div>
        </div>
      </section>

      {/* SECTION 2: RECENT REPORTS */}
      <section className="h-screen w-full snap-start flex flex-col justify-center bg-white dark:bg-slate-950 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 dark:text-white">
                <AlertTriangle className="text-red-500" />
                รายงานล่าสุด
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                ข้อมูลที่มีการแจ้งเข้ามาในระบบเมื่อเร็วๆ นี้
              </p>
            </div>
            <Link
              to="/reports"
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all dark:text-sky-300 dark:hover:text-sky-200"
            >
              ดูทั้งหมด <ChevronRight size={18} />
            </Link>
          </div>

          {/* 👉 กรองไม่ให้แสดง status === 'rejected' */}
          {(() => {
            const visibleReports = (recent || []).filter(
              (report) => report.status !== 'rejected',
            );

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleReports.map((report) => {
                  const type = report.account
                    ? 'account'
                    : report.channel?.toLowerCase().includes('phone')
                    ? 'phone'
                    : 'link';
                  const TypeIcon =
                    type === 'account' ? CreditCard : type === 'phone' ? Phone : Link2;

                  const statusLabel =
                    report.status === 'approved' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ';

                  const statusClass =
                    report.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/40'
                      : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40';

                  const created = report.createdAt
                    ? new Date(report.createdAt).toLocaleString()
                    : '—';

                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group dark:bg-slate-900 dark:border-slate-700"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`p-3 rounded-xl ${
                              type === 'account'
                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300'
                                : type === 'phone'
                                ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                            }`}
                          >
                            <TypeIcon size={24} />
                          </div>

                          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 dark:bg-slate-800 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {created}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors font-mono dark:text-slate-100 dark:group-hover:text-sky-300">
                          {report.account || report.name || '—'}
                        </h3>

                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-2 dark:text-slate-400">
                          {(report.bank || report.channel || 'ไม่ระบุ')} •{' '}
                          {report.name || 'ไม่ระบุชื่อ'}
                        </p>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusClass}`}
                          >
                            {statusLabel}
                          </span>

                          <div className="flex-grow" />

                          <Link
                            to={`/reports/${report.id}`}
                            className="text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-sky-300"
                            title="ดูรายละเอียด"
                            aria-label="ดูรายละเอียด"
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </div>

                      <div className="h-1 w-full bg-gradient-to-r from-slate-100 via-slate-100 to-slate-100 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800"></div>
                    </div>
                  );
                })}

                {visibleReports.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 dark:text-slate-400">
                    ยังไม่มีรายงานในระบบ
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* SECTION 3: CTA & STATS */}
      <section className="h-screen w-full snap-start flex flex-col justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-white text-slate-900 overflow-hidden relative dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none dark:bg-blue-600/25" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none dark:bg-purple-700/35" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
                พบเบาะแสการโกง? <br />
                <span className="text-blue-600 dark:text-sky-400">
                  ช่วยกันรายงานเพื่อสังคมที่ดีกว่า
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
                การรายงานของคุณช่วยป้องกันไม่ให้ผู้อื่นตกเป็นเหยื่อ ระบบของเราจะทำการตรวจสอบและแจ้งเตือนทันทีที่มีการค้นหาข้อมูลที่ตรงกัน
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'ปกปิดตัวตนผู้แจ้ง (Anonymous Reporting)',
                  'ตรวจสอบข้อมูลโดย AI และทีมงาน',
                  'แจ้งเตือนไปยังหน่วยงานที่เกี่ยวข้อง',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                    <span className="text-slate-800 dark:text-slate-100">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/report"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 group dark:bg-sky-500 dark:hover:bg-sky-400 dark:shadow-sky-500/40 w-fit"
              >
                <AlertTriangle className="text-amber-300 group-hover:animate-bounce" />
                แจ้งเบาะแสมิจฉาชีพ
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative dark:bg-slate-900 dark:border-slate-700">
                <div className="absolute -top-6 -right-6 bg-blue-600 p-4 rounded-2xl shadow-xl rotate-12">
                  <ShieldIcon size={32} className="text-white" />
                </div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <BarChart3 className="text-blue-600 dark:text-sky-400" />
                  สถิติการหลอกลวงเดือนนี้
                </h3>

                <div className="space-y-4">
                  {(fraudStats.items || []).map((item, idx) => {
                    const percent = Math.min(Math.max(item.percent || 0, 0), 100);
                    const palette = [
                      'bg-red-500',
                      'bg-orange-500',
                      'bg-amber-400',
                      'bg-blue-500',
                      'bg-emerald-500',
                    ];
                    const barColor = palette[idx % palette.length];

                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-700 dark:text-slate-200">
                          <span>{item.category}</span>
                          <span className="text-amber-600 font-semibold dark:text-amber-300">
                            {percent}%
                          </span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                          <div
                            className={`h-full ${barColor} rounded-full`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}

                  {(!fraudStats.items || fraudStats.items.length === 0) && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      ยังไม่มีข้อมูลสถิติ
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
