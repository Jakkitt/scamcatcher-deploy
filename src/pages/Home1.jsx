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
  fetchTopScammers,
} from '../services/reports';

const STAT_TEMPLATE = [
// ... (keep existing code) ...
];

export default function Home1() {
  // ... (keep existing state and effects) ...
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
  const [topScammers, setTopScammers] = useState([]);

  useEffect(() => {
    // ... (keep existing effects) ...
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

    (async () => {
      try {
        const top = await fetchTopScammers(5);
        if (!alive) return;
        setTopScammers(top || []);
      } catch (err) {
        console.warn('fetchTopScammers failed', err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950">
      
      {/* SECTION 1: HERO */}
      <section className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden bg-white dark:bg-black">
        {/* BG Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
          {/* Animated blobs */}
          <div className="absolute -top-24 -left-10 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full animate-pulse dark:bg-blue-600/30" />
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-300/20 blur-3xl rounded-full animate-pulse delay-1000 dark:bg-cyan-600/20" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-300/15 blur-3xl rounded-full animate-pulse delay-2000 dark:bg-emerald-600/20" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center justify-center h-full">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mt-5 mb-6 leading-normal animate-fade-in-up">
              รู้ทันโจรไซเบอร์
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 py-1 block w-fit mx-auto mt-4">
                ตรวจสอบก่อนโอน มั่นใจปลอดภัย
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
              {t('layout.brand')} ช่วยให้คุณตรวจสอบประวัติการโกง เช็คเบอร์โทรและเลขบัญชีต้องสงสัย
              จากฐานข้อมูลที่รวบรวมโดยชุมชนผู้ใช้งานจริงทั่วประเทศ
            </p>
          </div>

          {/* Top Scammers / Danger Zone */}
          <div className="max-w-4xl w-full mx-auto animate-fade-in-up delay-200 mb-16">
            <div className="bg-white/80 backdrop-blur-md border border-red-100 rounded-2xl shadow-xl overflow-hidden dark:bg-slate-900/80 dark:border-red-900/30">
              <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center justify-between dark:bg-red-900/10 dark:border-red-900/30">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="animate-pulse" />
                  <h3 className="font-bold text-lg">บัญชีอันตรายที่ต้องระวัง (Top 5)</h3>
                </div>
                <span className="text-xs text-red-500 font-medium bg-red-100 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-300">
                  มีการรายงานเข้ามาบ่อยที่สุด
                </span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {topScammers.length > 0 ? (
                  topScammers.map((item, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm dark:bg-red-900/30 dark:text-red-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{item.bank}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="font-mono">{item.account}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-bold text-lg dark:text-red-400">{item.count}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">ครั้งที่รายงาน</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    ยังไม่มีข้อมูลบัญชีอันตรายในขณะนี้
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-14 animate-bounce text-slate-400 dark:text-slate-500">
            <ChevronDown size={32} />
          </div>
        </div>
      </section>

      {/* SECTION 2: RECENT REPORTS */}
      <section className="h-screen w-full snap-start flex flex-col justify-center relative overflow-hidden bg-white dark:bg-black">
        {/* BG Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-slate-950 dark:via-red-950 dark:to-slate-900">
          {/* Animated blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-400/15 blur-3xl rounded-full animate-pulse dark:bg-red-600/20" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-orange-300/20 blur-3xl rounded-full animate-pulse delay-1000 dark:bg-orange-600/20" />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-amber-300/15 blur-3xl rounded-full animate-pulse delay-2000 dark:bg-amber-600/15" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
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
              to="/public-reports"
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all dark:text-sky-300 dark:hover:text-sky-200"
            >
              ดูทั้งหมด <ChevronRight size={18} />
            </Link>
          </div>

          {/* 👉 กรองให้แสดงแต่ status === 'approved' เท่านั้น */}
          {(() => {
            const visibleReports = (recent || []).filter(
              (report) => report.status === 'approved',
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

                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-sky-300">
                          {report.name || 'ไม่ระบุชื่อ'}
                        </h3>

                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-2 dark:text-slate-400">
                          {(report.bank ||
                            (report.channel === 'OTHER' ? 'อื่นๆ' : report.channel) ||
                            'ไม่ระบุ')} •{' '}
                          <span className="font-mono">{report.account || '—'}</span>
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
        
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce text-slate-400 dark:text-slate-500">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* SECTION 3: CTA & STATS */}
      <section className="h-screen w-full snap-start flex flex-col justify-center relative overflow-hidden bg-white dark:bg-black">
        {/* BG Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900">
          {/* Animated blobs */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-purple-400/20 blur-3xl rounded-full animate-pulse dark:bg-purple-600/25" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/20 blur-3xl rounded-full animate-pulse delay-1000 dark:bg-blue-600/20" />
          <div className="absolute top-1/3 left-0 w-72 h-72 bg-cyan-300/15 blur-3xl rounded-full animate-pulse delay-2000 dark:bg-cyan-600/20" />
        </div>

        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none dark:bg-blue-600/25 z-0" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none dark:bg-purple-700/35 z-0" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-[2.0] text-slate-900 dark:text-white">
                พบเบาะแสการโกง? <br />
                <span className="text-blue-600 dark:text-sky-400 py-1">
                  ช่วยกันรายงานเพื่อสังคมที่ดีกว่า
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
                การรายงานของคุณช่วยป้องกันไม่ให้ผู้อื่นตกเป็นเหยื่อ ระบบของเราจะทำการตรวจสอบและแจ้งเตือนทันทีที่มีการค้นหาข้อมูลที่ตรงกัน
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'ปกปิดตัวตนผู้แจ้ง (Anonymous Reporting)',
                  'ตรวจสอบข้อมูลโดยทีมงาน',
                  'มั่นใจในการทำธุรกรรมออนไลน์',
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
                  สถิติรายงานการหลอกลวงในเดือนนี้
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
                          <span>
                            {{
                              investment: 'หลอกลงทุน',
                              shopping: 'ซื้อของออนไลน์',
                              job: 'หลอกทำงาน',
                              loan: 'เงินกู้',
                              romance: 'หลอกให้รัก',
                              bill: 'บิล/ภาษีปลอม',
                              other: 'อื่นๆ',
                            }[item.category] || item.category}
                          </span>
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
