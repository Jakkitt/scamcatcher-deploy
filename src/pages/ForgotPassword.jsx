import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, LogIn, UserPlus } from 'lucide-react';
import { t } from '../i18n/strings';
import { requestPasswordReset } from '../services/auth';

export default function ForgotPassword() {
  const copy = t('auth.forgot') || {};
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // '', 'success', 'error'

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setStatus('');
    if (!email.trim()) {
      setMessage(copy.emailRequired || t('auth.login.errors.emailRequired', 'กรุณากรอกอีเมล'));
      setStatus('error');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
      setStatus('success');
      setMessage(copy.success || t('auth.forgot.success', 'ส่งลิงก์รีเซ็ตแล้ว โปรดตรวจสอบกล่องอีเมลหรือสแปม'));
    } catch (err) {
      setStatus('error');
      const friendly =
        err?.message === 'VITE_API_BASE_URL is not set'
          ? t('auth.login.errors.notReady', 'ระบบยังไม่พร้อมใช้งาน: โปรดตั้งค่า VITE_API_BASE_URL ในไฟล์ .env แล้วรันใหม่')
          : err?.message;
      setMessage(friendly || copy.genericError || t('auth.forgot.genericError', 'ไม่สามารถส่งคำขอรีเซ็ตได้'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden flex items-center justify-center py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          style={{ left: `${mousePos.x / 20}px`, top: `${mousePos.y / 20}px`, transition: 'all 0.3s ease-out' }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl"
          style={{ right: `${mousePos.x / 30}px`, bottom: `${mousePos.y / 30}px`, transition: 'all 0.4s ease-out' }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4 mt-4">
        <div className="rounded-3xl p-10 sm:p-12 border-4 border-cyan-400/20 bg-gradient-to-b from-gray-950/80 via-gray-950 to-black shadow-[0_20px_80px_rgba(6,182,212,0.25)] text-white">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-3">{copy.title || 'ลืมรหัสผ่าน'}</h1>
            <p className="text-sm text-gray-400">{copy.subtitle || 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'}</p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div className="h-5 text-center text-sm">
              <span
                className={
                  status === 'error'
                    ? 'text-red-400'
                    : status === 'success'
                      ? 'text-emerald-400'
                      : 'opacity-0'
                }
              >
                {message || 'placeholder'}
              </span>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.emailLabel || 'อีเมล'}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder || 'your@email.com'}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (copy.submitting || 'กำลังส่ง...') : (
                <>
                  <Send className="w-5 h-5" />
                  {copy.submit || 'ส่งลิงก์รีเซ็ต'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/70 text-gray-300">{copy.divider || 'หรือตัวเลือกอื่น'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full h-11 rounded-xl font-semibold border-2 border-cyan-400/40 hover:border-cyan-300/60 text-white flex items-center justify-center gap-2 transition-all hover:bg-cyan-400/10"
            >
              <LogIn className="w-5 h-5" />
              {copy.backToLogin || 'ย้อนกลับไปเข้าสู่ระบบ'}
            </Link>
            <Link
              to="/register"
              className="w-full h-11 rounded-xl font-semibold border-2 border-cyan-400/40 hover:border-cyan-300/60 text-white flex items-center justify-center gap-2 transition-all hover:bg-cyan-400/10"
            >
              <UserPlus className="w-5 h-5" />
              {copy.registerCta || 'สมัครสมาชิก'}
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {copy.notice || 'หากไม่พบอีเมล กรุณาตรวจสอบสแปมหรือรอ 1-2 นาที'}
          </p>
        </div>
      </div>
    </div>
  );
}
