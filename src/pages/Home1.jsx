import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  AlertTriangle,
  Phone,
  CreditCard,
  CheckCircle,
  BarChart3,
  Eye,
  Mail,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { t } from '../i18n/strings';

export default function Home1() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const recentReports = [
    { id: 1, type: 'account', value: '123-4-56789-0', bank: 'กสิกรไทย', name: 'นายสมชาย ใจดี (ปลอม)', status: 'fraud', time: '2 นาทีที่แล้ว' },
    { id: 2, type: 'phone', value: '081-234-5678', provider: 'AIS', name: 'แก๊งคอลเซ็นเตอร์', status: 'warning', time: '5 นาทีที่แล้ว' },
    { id: 3, type: 'link', value: 'bit.ly/free-money', provider: 'SMS', name: 'ลิงก์ดูดเงิน', status: 'fraud', time: '12 นาทีที่แล้ว' },
  ];

  const stats = [
    { label: 'รายงานวันนี้', value: '1,240', color: 'text-blue-400' },
    { label: 'เบอร์โทรมิจฉาชีพ', value: '85,000+', color: 'text-red-400' },
    { label: 'บัญชีที่ถูกระงับ', value: '12,500', color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Hero */}
      <header className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              ฐานข้อมูลอัปเดตล่าสุด: วันนี้ 08:30 น.
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              รู้ทันโจรไซเบอร์ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                ตรวจสอบก่อนโอน มั่นใจปลอดภัย
              </span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              {t('layout.brand')} ช่วยให้คุณตรวจสอบประวัติการโกง เช็กเบอร์โทรและเลขบัญชีต้องสงสัย จากฐานข้อมูลที่รวบรวมโดยชุมชนผู้ใช้จริงทั่วประเทศ
            </p>

            <div className="bg-white/95 p-2 rounded-2xl shadow-2xl shadow-blue-900/20 max-w-3xl mx-auto border border-slate-200">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-14 pl-12 pr-4 bg-white rounded-xl text-slate-900 placeholder-slate-700 caret-blue-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 transition-all text-lg border border-slate-400 font-semibold"
                    placeholder="ค้นหาเลขบัญชี, เบอร์โทร, หรือชื่อ-นามสกุล..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <Link
                  to="/search/detail"
                  className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg whitespace-nowrap"
                >
                  ตรวจสอบทันที
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <span>คำค้นหายอดนิยม:</span>
              <button className="hover:text-blue-300 underline decoration-dotted">#เบอร์โทรแก๊งคอลเซ็นเตอร์</button>
              <button className="hover:text-blue-300 underline decoration-dotted">#บัญชีม้า</button>
              <button className="hover:text-blue-300 underline decoration-dotted">#SMSหลอกลวง</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors group">
                <h3 className={`text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>{stat.value}</h3>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Recent Reports */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                รายงานล่าสุด
              </h2>
              <p className="text-slate-500">ข้อมูลที่มีการแจ้งเข้ามาในระบบเมื่อเร็วๆ นี้</p>
            </div>
            <Link to="/reports" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        report.type === 'account'
                          ? 'bg-purple-50 text-purple-600'
                          : report.type === 'phone'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {report.type === 'account' ? <CreditCard size={24} /> : report.type === 'phone' ? <Phone size={24} /> : <Shield size={24} />}
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      {report.time}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors font-mono">
                    {report.value}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 flex items-center gap-2">
                    {report.bank || report.provider} • {report.name}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        report.status === 'fraud'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {report.status === 'fraud' ? 'อันตราย (Fraud)' : 'เฝ้าระวัง (Warning)'}
                    </span>
                    <div className="flex-grow"></div>
                    <button className="text-slate-400 hover:text-blue-500">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-slate-100 via-slate-100 to-slate-100 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                พบเบาะแสการโกง? <br />
                <span className="text-blue-400">ช่วยกันรายงานเพื่อสังคมที่ดีกว่า</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                การรายงานของคุณช่วยป้องกันไม่ให้ผู้อื่นตกเป็นเหยื่อ ระบบของเราจะทำการตรวจสอบและแจ้งเตือนทันทีที่มีการค้นหาข้อมูลที่ตรงกัน
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'ปกปิดตัวตนผู้แจ้ง (Anonymous Reporting)',
                  'ตรวจสอบข้อมูลโดย AI และทีมงาน',
                  'แจ้งเตือนไปยังหน่วยงานที่เกี่ยวข้อง',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/report"
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 group"
              >
                <AlertTriangle className="text-red-500 group-hover:animate-bounce" />
                แจ้งเบาะแสมิจฉาชีพ
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl relative">
                <div className="absolute -top-6 -right-6 bg-blue-600 p-4 rounded-2xl shadow-xl rotate-12">
                  <Shield size={32} className="text-white" />
                </div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="text-blue-400" />
                  สถิติการหลอกลวงเดือนนี้
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>หลอกขายสินค้าออนไลน์</span>
                      <span className="text-red-400">45%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>แก๊งคอลเซ็นเตอร์</span>
                      <span className="text-orange-400">30%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[30%] bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>หลอกกู้เงิน/ลงทุน</span>
                      <span className="text-yellow-400">15%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[15%] bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 border-t border-slate-800 py-10 text-slate-400">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">ScamCatcher</p>
              <p className="text-xs text-slate-500">ป้องกันการถูกหลอกลวงออนไลน์</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} />
            <span>support@scamcatcher.local</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-slate-700 text-white hover:bg-white/10 transition font-semibold"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
