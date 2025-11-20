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

  const statusColor = status === 'error' ? 'text-red-400' : status === 'success' ? 'text-emerald-400' : 'opacity-0';

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden flex items-center justify-center py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl left-5 top-10" />
        <div className="absolute w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl right-0 bottom-0" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 mt-4">
        <div className="rounded-3xl p-10 sm:p-12 border-4 border-cyan-400/20 bg-gradient-to-b from-gray-950/80 via-gray-950 to-black shadow-[0_20px_80px_rgba(6,182,212,0.25)] text-white">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-3 flex items-center justify-center gap-2">
              <Lock className="w-7 h-7 text-cyan-300" />
              {copy.title || 'รีเซ็ตรหัสผ่าน'}
            </h1>
            <p className="text-sm text-gray-400">{copy.subtitle || 'ตั้งรหัสผ่านใหม่ด้วยลิงก์ที่ได้รับทางอีเมล'}</p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div className="h-5 text-center text-sm">
              <span className={statusColor}>{message || 'placeholder'}</span>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.passwordLabel || 'รหัสผ่านใหม่'}</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <input
                  type={show.password ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                  onClick={() => setShow((s) => ({ ...s, password: !s.password }))}
                >
                  {show.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.confirmLabel || 'ยืนยันรหัสผ่านใหม่'}</label>
              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                  onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                >
                  {show.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (copy.submitting || 'กำลังบันทึก...') : (
                <>
                  <RefreshCcw className="w-5 h-5" />
                  {copy.submit || 'บันทึกรหัสผ่านใหม่'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/70 text-gray-300">{copy.divider || t('auth.login.divider', 'หรือ')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full h-11 rounded-xl font-semibold border-2 border-cyan-400/40 hover:border-cyan-300/60 text-white flex items-center justify-center gap-2 transition-all hover:bg-cyan-400/10"
            >
              <LogIn className="w-5 h-5" />
              {copy.goLogin || t('auth.reset.goLogin', 'กลับไปเข้าสู่ระบบ')}
            </Link>
            <Link
              to="/forgot-password"
              className="w-full h-11 rounded-xl font-semibold border-2 border-cyan-400/40 hover:border-cyan-300/60 text-white flex items-center justify-center gap-2 transition-all hover:bg-cyan-400/10"
            >
              <RefreshCcw className="w-5 h-5" />
              {copy.goForgot || t('auth.reset.goForgot', 'ขอลิงก์ใหม่')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
