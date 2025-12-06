import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, KeyRound, LogIn, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { t } from '../i18n/strings';
import { resetPassword } from '../services/auth';

export default function ResetPassword() {
  const copy = t('auth.reset') || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState({ password: false, confirm: false });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(copy.tokenMissing || t('auth.reset.tokenMissing', 'ลิงก์ไม่ถูกต้องหรือหมดอายุ'));
    }
  }, [token, copy.tokenMissing]);

  const validate = () => {
    if (!token) {
      setStatus('error');
      setMessage(copy.tokenMissing || t('auth.reset.tokenMissing', 'ลิงก์ไม่ถูกต้องหรือหมดอายุ'));
      return false;
    }
    if (!password || !confirm) {
      setStatus('error');
      setMessage(copy.genericError || t('auth.reset.genericError', 'ไม่สามารถรีเซ็ตรหัสผ่านได้'));
      return false;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage(copy.mismatch || t('auth.reset.mismatch', 'รหัสผ่านไม่ตรงกัน'));
      return false;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage(copy.min8 || t('auth.reset.min8', 'อย่างน้อย 8 ตัวอักษร'));
      return false;
    }
    if (password.length > 72) {
      setStatus('error');
      setMessage(copy.max72 || t('auth.reset.max72', 'ไม่เกิน 72 ตัวอักษร'));
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setMessage('');
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password });
      setStatus('success');
      setMessage(copy.success || t('auth.reset.success', 'รีเซ็ตรหัสผ่านสำเร็จแล้ว'));
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      const friendly = err?.message === 'VITE_API_BASE_URL is not set'
        ? t('auth.login.errors.notReady', 'ระบบยังไม่พร้อมใช้งาน: โปรดตั้งค่า VITE_API_BASE_URL ในไฟล์ .env แล้วรันใหม่')
        : err?.message;
      setStatus('error');
      setMessage(friendly || copy.genericError || t('auth.reset.genericError', 'ไม่สามารถรีเซ็ตรหัสผ่านได้'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageColor =
    status === "error"
      ? "text-rose-500"
      : status === "success"
      ? "text-emerald-500"
      : "opacity-0";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/cyber_circuit_bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 dark:from-black/90 dark:via-black/50 dark:to-black/90" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
        <div className="w-full max-w-md mx-4 my-12">
          {/* Card */}
          <div className="rounded-3xl p-10 sm:p-12 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                          dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                {copy.title || 'รีเซ็ตรหัสผ่าน'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {copy.subtitle || 'ตั้งรหัสผ่านใหม่ด้วยลิงก์ที่ได้รับทางอีเมล'}
              </p>
            </div>

            <div className="h-5 text-center text-sm mb-4">
              <span className={messageColor}>{message || 'placeholder'}</span>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-slate-200">
                  {copy.passwordLabel || 'รหัสผ่านใหม่'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <input
                    type={show.password ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, password: !s.password }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-300 transition-colors"
                  >
                    {show.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-slate-200">
                  {copy.confirmLabel || 'ยืนยันรหัสผ่านใหม่'}
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-300 transition-colors"
                  >
                    {show.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  copy.submitting || 'กำลังบันทึก...'
                ) : (
                  <>
                    <RefreshCcw className="w-5 h-5" />
                    {copy.submit || 'บันทึกรหัสผ่านใหม่'}
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  {copy.divider || t('auth.login.divider', 'หรือ')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full h-11 rounded-xl font-semibold border border-slate-300 text-slate-800 hover:border-sky-500 hover:bg-sky-50 flex items-center justify-center gap-2 transition-all dark:border-slate-600 dark:text-white dark:hover:border-sky-400 dark:hover:bg-slate-900/60"
              >
                <LogIn className="w-5 h-5" />
                {copy.goLogin || t('auth.reset.goLogin', 'กลับไปเข้าสู่ระบบ')}
              </Link>
              <Link
                to="/forgot-password"
                className="w-full h-11 rounded-xl font-semibold border border-slate-300 text-slate-800 hover:border-sky-500 hover:bg-sky-50 flex items-center justify-center gap-2 transition-all dark:border-slate-600 dark:text-white dark:hover:border-sky-400 dark:hover:bg-slate-900/60"
              >
                <RefreshCcw className="w-5 h-5" />
                {copy.goForgot || t('auth.reset.goForgot', 'ขอลิงก์ใหม่')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
