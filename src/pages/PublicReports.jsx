import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  CreditCard,
  Link2,
  Eye,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { fetchPublicReports } from '../services/reports';
import { t } from '../i18n/strings';

export default function PublicReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await fetchPublicReports(100);
        if (!alive) return;
        setReports(data || []);
      } catch (err) {
        if (!alive) return;
        console.warn('fetchPublicReports failed', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const name = (report.name || '').toLowerCase();
    const account = (report.account || '').toLowerCase();
    const bank = (report.bank || '').toLowerCase();
    
    return name.includes(query) || account.includes(query) || bank.includes(query);
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* พื้นหลัง */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] dark:opacity-[0.08]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-400/20 blur-[110px] rounded-full pointer-events-none dark:bg-blue-600/25" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[520px] bg-cyan-300/15 blur-[100px] rounded-full pointer-events-none dark:bg-cyan-500/15" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6"
        >
          <ChevronLeft size={18} />
          กลับหน้าแรก
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📋 รายงานมิจฉาชีพทั้งหมด
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            รายการที่ได้รับการตรวจสอบและอนุมัติแล้ว
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาจากชื่อ, เลขบัญชี, หรือธนาคาร..."
              className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            ยังไม่มีรายงานในระบบ
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            ไม่พบรายงานที่ตรงกับคำค้นหา "{searchQuery}"
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const type = report.account
                  ? 'account'
                  : report.channel?.toLowerCase().includes('phone')
                  ? 'phone'
                  : 'link';
                const TypeIcon =
                  type === 'account' ? CreditCard : type === 'phone' ? Phone : Link2;

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
                        {(report.bank || report.channel || 'ไม่ระบุ')} •{' '}
                        <span className="font-mono">{report.account || '—'}</span>
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/40">
                          อนุมัติแล้ว
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
            </div>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? (
                <>
                  แสดง {filteredReports.length} จาก {reports.length} รายการ
                </>
              ) : (
                <>แสดง {reports.length} รายการ</>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
